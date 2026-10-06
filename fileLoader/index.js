const fs = require('fs')
const path = require('node:path')
const { nanoid } = require('nanoid')
const { createHash } = require('crypto')
const sharp = require('sharp')
const { getFolderlist, solveBookTypeFolder, getImageListFromFolder, deleteImageFromFolder } = require('./folder.js')
const { getArchivelist, solveBookTypeArchive, getImageListFromArchive, deleteImageFromArchive } = require('./archive.js')
const { getZipFilelist, solveBookTypeZip } = require('./zip.js')
const { getMobiFilelist, solveBookTypeMobi, getImageListFromMobi } = require('./mobi.js')
const { TEMP_PATH, COVER_PATH, VIEWER_PATH } = require('../modules/init_folder_setting.js')

const getBookFilelist = async (library) => {
  const folderList = await getFolderlist(library)
  const archiveList = await getArchivelist(library)
  const zipList = await getZipFilelist(library)
  const mobiList = await getMobiFilelist(library)
  return [
    ...folderList.map(filepath => ({ filepath, type: 'folder' })),
    ...archiveList.map(filepath => ({ filepath, type: 'archive' })),
    ...zipList.map(filepath => ({ filepath, type: 'zip' })),
    ...mobiList.map(filepath => ({ filepath, type: 'mobi' })),
  ]
}

const geneCover = async (filepath, type) => {
  let targetFilePath, coverPath, tempCoverPath, pageCount, bundleSize, mtime
  switch (type) {
    case 'folder':
      ;({ targetFilePath, coverPath, tempCoverPath, pageCount, bundleSize, mtime } = await solveBookTypeFolder(filepath, TEMP_PATH, COVER_PATH))
      break
    case 'zip':
      try {
        ;({ targetFilePath, coverPath, tempCoverPath, pageCount, bundleSize, mtime } = await solveBookTypeArchive(filepath, TEMP_PATH, COVER_PATH))
      } catch (e) {
        console.log(e)
        console.log(`reload ${filepath} use adm-zip`)
        ;({ targetFilePath, coverPath, tempCoverPath, pageCount, bundleSize, mtime } = await solveBookTypeZip(filepath, TEMP_PATH, COVER_PATH))
      }
      break
    case 'archive':
      ;({ targetFilePath, coverPath, tempCoverPath, pageCount, bundleSize, mtime } = await solveBookTypeArchive(filepath, TEMP_PATH, COVER_PATH))
      break
    case 'mobi':
      ;({ targetFilePath, coverPath, tempCoverPath, pageCount, bundleSize, mtime } = await solveBookTypeMobi(filepath, TEMP_PATH, COVER_PATH))
      break
  }

  const coverHash = createHash('sha1').update(fs.readFileSync(tempCoverPath)).digest('hex')
  const copyTempCoverPath = path.join(TEMP_PATH, nanoid(8) + path.extname(tempCoverPath))
  await fs.promises.copyFile(tempCoverPath, copyTempCoverPath)
  await sharp(copyTempCoverPath, { failOnError: false })
    .resize(500, 707, {
      fit: 'contain',
      background: '#303133'
    })
    .toFile(coverPath)
  return { targetFilePath, coverPath, pageCount, bundleSize, mtime, coverHash }
}

const getImageListByBook = async (filepath, type) => {
  switch (type) {
    case 'folder':
      return await getImageListFromFolder(filepath, VIEWER_PATH)
    case 'zip':
    case 'archive':
      return await getImageListFromArchive(filepath, VIEWER_PATH)
    case 'mobi':
      return await getImageListFromMobi(filepath, VIEWER_PATH)
    default:
      return await getImageListFromArchive(filepath, VIEWER_PATH)
  }
}

const deleteImageFromBook = async (filename, filepath, type) => {
  switch (type) {
    case 'folder':
      return await deleteImageFromFolder(filename, filepath)
    case 'zip':
    case 'archive':
      return await deleteImageFromArchive(filename, filepath)
    case 'mobi':
      // MOBI 为只读容器，不支持删除内嵌图片
      return false
    default:
      return await deleteImageFromArchive(filename, filepath)
  }
}

module.exports = {
  getBookFilelist,
  geneCover,
  getImageListByBook,
  deleteImageFromBook
}