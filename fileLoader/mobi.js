const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')
const { nanoid } = require('nanoid')
const { createHash } = require('crypto')
const sharp = require('sharp')

// MOBI（Mobipocket / PDB）容器里的正文记录使用 PalmDOC 压缩，
// 但图片记录是原样存储的，所以可以直接从记录数据里扫描出图片文件头来提取。
const IMAGE_SIGNATURES = [
  {
    type: 'jpeg',
    ext: '.jpg',
    check: (buffer, index) => buffer[index] === 0xFF && buffer[index + 1] === 0xD8 && buffer[index + 2] === 0xFF
  },
  {
    type: 'png',
    ext: '.png',
    check: (buffer, index) =>
      buffer[index] === 0x89 &&
      buffer[index + 1] === 0x50 &&
      buffer[index + 2] === 0x4E &&
      buffer[index + 3] === 0x47 &&
      buffer[index + 4] === 0x0D &&
      buffer[index + 5] === 0x0A &&
      buffer[index + 6] === 0x1A &&
      buffer[index + 7] === 0x0A
  },
  {
    type: 'gif',
    ext: '.gif',
    check: (buffer, index) =>
      buffer[index] === 0x47 && buffer[index + 1] === 0x49 && buffer[index + 2] === 0x46 && buffer[index + 3] === 0x38
  }
]

const PNG_END = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82])

const getMobiFilelist = async (libraryPath) => {
  const list = globSync('**/*.@(mobi|azw|azw3)', {
    cwd: libraryPath,
    nocase: true,
    nodir: true,
    follow: true,
    absolute: true
  })
  return list
}

// GIF 的数据以子块形式组织，逐块跳过直到结束标记，避免把图像数据里的 0x3B 误判为结尾
const skipGifSubBlocks = (buffer, pos) => {
  while (pos < buffer.length) {
    const length = buffer[pos]
    if (length === 0) return pos + 1
    pos += 1 + length
  }
  return -1
}

const findGifEnd = (buffer, start) => {
  let pos = start + 6
  if (pos + 7 > buffer.length) return -1
  const screenPacked = buffer[pos + 4]
  pos += 7
  if (screenPacked & 0x80) pos += 3 * (1 << ((screenPacked & 0x07) + 1))
  while (pos < buffer.length) {
    const block = buffer[pos]
    if (block === 0x3B) return pos + 1
    if (block === 0x2C) {
      if (pos + 10 > buffer.length) return -1
      const imagePacked = buffer[pos + 9]
      pos += 10
      if (imagePacked & 0x80) pos += 3 * (1 << ((imagePacked & 0x07) + 1))
      pos += 1
      pos = skipGifSubBlocks(buffer, pos)
    } else if (block === 0x21) {
      pos = skipGifSubBlocks(buffer, pos + 2)
    } else {
      return -1
    }
    if (pos === -1) return -1
  }
  return -1
}

// 找到从 start 开始的这张图片的结束位置
const findImageEnd = (buffer, start, type) => {
  switch (type) {
    case 'jpeg': {
      for (let i = start + 2; i < buffer.length - 1; i++) {
        if (buffer[i] === 0xFF && buffer[i + 1] === 0xD9) return i + 2
      }
      return -1
    }
    case 'png': {
      const index = buffer.indexOf(PNG_END, start)
      return index === -1 ? -1 : index + PNG_END.length
    }
    case 'gif':
      return findGifEnd(buffer, start)
    default:
      return -1
  }
}

// 在一段记录数据里扫描所有图片（一条记录里可能含有连续多张图）
const scanImagesInBuffer = (buffer) => {
  const found = []
  let i = 0
  while (i < buffer.length - 3) {
    const signature = IMAGE_SIGNATURES.find(sig => sig.check(buffer, i))
    if (signature) {
      let end = findImageEnd(buffer, i, signature.type)
      if (end === -1) end = buffer.length
      if (end - i > 64) {
        found.push({ buffer: buffer.subarray(i, end), ext: signature.ext })
      }
      i = end
    } else {
      i++
    }
  }
  return found
}

// 按 PDB 记录表逐条读取记录，跳过 PalmDOC 正文记录，提取图片记录中的图片
const extractImagesFromMobi = async (filepath) => {
  const fd = await fs.promises.open(filepath, 'r')
  try {
    const fileSize = (await fd.stat()).size
    if (fileSize < 90) return []

    const pdbHeader = Buffer.alloc(78)
    await fd.read(pdbHeader, 0, 78, 0)
    const numRecords = pdbHeader.readUInt16BE(76)
    if (numRecords === 0) return []

    const recordInfo = Buffer.alloc(numRecords * 8)
    await fd.read(recordInfo, 0, recordInfo.length, 78)
    const recordOffsets = []
    for (let i = 0; i < numRecords; i++) {
      recordOffsets.push(recordInfo.readUInt32BE(i * 8))
    }
    recordOffsets.push(fileSize)

    // record 0 的 PalmDOC header 第 8 字节记录了正文记录数，图片记录在其后
    let textRecordCount = 0
    if (numRecords > 1) {
      const palmDocHeader = Buffer.alloc(16)
      await fd.read(palmDocHeader, 0, 16, recordOffsets[0])
      textRecordCount = palmDocHeader.readUInt16BE(8)
    }
    let scanStart = textRecordCount + 1
    if (scanStart < 1 || scanStart >= numRecords) scanStart = 1

    const images = []
    const seen = new Set()
    for (let i = scanStart; i < numRecords; i++) {
      const start = recordOffsets[i]
      const length = recordOffsets[i + 1] - start
      if (length <= 0) continue
      const record = Buffer.alloc(length)
      await fd.read(record, 0, length, start)
      for (const candidate of scanImagesInBuffer(record)) {
        const hash = createHash('sha1').update(candidate.buffer).digest('hex')
        if (seen.has(hash)) continue
        let metadata
        try {
          // 用 sharp 校验候选数据确实能完整解码，过滤压缩正文里的误命中以及被截断的候选
          metadata = await sharp(candidate.buffer).metadata()
        } catch {
          continue
        }
        if (!metadata || !metadata.width || !metadata.height) continue
        seen.add(hash)
        images.push(candidate)
      }
    }
    return images
  } finally {
    await fd.close()
  }
}

// 把提取到的图片写入目标目录，返回与压缩包类型一致的 {relativePath, absolutePath} 列表
const writeImages = async (images, folder) => {
  await fs.promises.mkdir(folder, { recursive: true })
  const list = []
  for (let i = 0; i < images.length; i++) {
    const relativePath = `${String(i + 1).padStart(4, '0')}${images[i].ext}`
    const absolutePath = path.join(folder, relativePath)
    await fs.promises.writeFile(absolutePath, images[i].buffer)
    list.push({ relativePath, absolutePath })
  }
  return list
}

const solveBookTypeMobi = async (filepath, TEMP_PATH, COVER_PATH) => {
  const images = await extractImagesFromMobi(filepath)
  if (images.length === 0) throw new Error('mobi file does not include image')

  const list = await writeImages(images, path.join(TEMP_PATH, nanoid(8)))
  const targetFile = list.length > 8 ? list[7] : list[0]
  const coverFile = list[0]

  const targetFilePath = path.join(TEMP_PATH, nanoid(8) + path.extname(targetFile.absolutePath))
  await fs.promises.copyFile(targetFile.absolutePath, targetFilePath)

  const tempCoverPath = path.join(TEMP_PATH, nanoid(8) + path.extname(coverFile.absolutePath))
  await fs.promises.copyFile(coverFile.absolutePath, tempCoverPath)

  const coverPath = path.join(COVER_PATH, nanoid() + '.webp')

  const fileStat = await fs.promises.stat(filepath)
  return { targetFilePath, tempCoverPath, coverPath, pageCount: list.length, bundleSize: fileStat?.size, mtime: fileStat?.mtime }
}

const getImageListFromMobi = async (filepath, VIEWER_PATH) => {
  const images = await extractImagesFromMobi(filepath)
  return await writeImages(images, path.join(VIEWER_PATH, nanoid(8)))
}

module.exports = {
  getMobiFilelist,
  solveBookTypeMobi,
  getImageListFromMobi
}