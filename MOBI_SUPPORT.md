# MOBI 解析能力支持说明

## 一、目的

为应用新增对 **MOBI（Mobipocket）电子书** 的解析能力，使 `.mobi` / `.azw` / `.azw3` 等 Kindle 系漫画文件可以与现有的 `folder` / `zip` / `archive` 类型一样，被扫描入库、生成封面、并直接在软件内置查看器中阅读。

## 二、修改内容

### 1. 新增文件：`fileLoader/mobi.js`

实现 MOBI 容器的解析与图片提取，对外导出三个函数，接口与 `archive.js` / `zip.js` 保持一致：

| 函数 | 作用 |
| --- | --- |
| `getMobiFilelist(libraryPath)` | 扫描书库中的 `.mobi` / `.azw` / `.azw3` 文件，返回绝对路径列表 |
| `solveBookTypeMobi(filepath, TEMP_PATH, COVER_PATH)` | 解析书籍，返回 `{ targetFilePath, tempCoverPath, coverPath, pageCount, bundleSize, mtime }` |
| `getImageListFromMobi(filepath, VIEWER_PATH)` | 提取全部内嵌图片供查看器使用，返回 `{ relativePath, absolutePath }` 列表 |

### 2. 修改文件：`fileLoader/index.js`

将 `mobi` 作为新的书籍类型接入既有流程：

- `getBookFilelist`：新增 `mobiList`，以 `{ filepath, type: 'mobi' }` 形式并入扫描结果；
- `geneCover`：新增 `case 'mobi'`，分派到 `solveBookTypeMobi`；
- `getImageListByBook`：新增 `case 'mobi'`，分派到 `getImageListFromMobi`；
- `deleteImageFromBook`：新增 `case 'mobi'`，返回 `false`（MOBI 为只读容器，不支持删除内嵌图片）。

> 主进程 `index.js`、`preload.js` 与前端渲染层**无需改动**：书籍 `type` 在数据库中为普通 `TEXT` 字段，扫描流程、IPC 通道与查看器均按 `type` 泛型透传，新增类型会自动生效。

## 三、技术实现

MOBI 文件本质是 **Palm Database（PDB）容器**：文件头 78 字节，其后是记录偏移表，每条记录是一段数据。容器中：

- 正文记录使用 **PalmDOC** 等算法压缩；
- **图片记录则以原始字节直接存储**（不压缩）。

因此不需要引入任何第三方解析库，直接按下列步骤提取图片即可：

1. 读取 78 字节 PDB 文件头，从偏移 `76` 处取得记录总数 `numRecords`；
2. 读取记录偏移表，计算每条记录在文件中的起止区间；
3. 读取 `record 0` 的 PalmDOC 头，其偏移 `8` 处记录了正文记录数，据此定位图片记录区（正文之后）；
4. 逐条读取图片记录，扫描 JPEG（`FF D8 FF`…`FF D9`）、PNG（IEND 块）、GIF（走完 GIF 子块结构找 `3B` 结束符）文件头并截取完整图片；
5. 使用项目已有的 `sharp` 对候选数据做**严格解码校验**，过滤压缩正文中偶然命中的字节和被截断的数据；
6. 以图片内容 sha1 去重，兼容 AZW3 中 MOBI6/KF8 双段导致的重复图片。

其余处理复用现有图片型管线：首图作为封面、第 8 张（或第 1 张）作为哈希目标页、图片统一写入临时目录后交由查看器按绝对路径加载。

## 四、支持的格式

| 扩展名 | 说明 |
| --- | --- |
| `.mobi` | 标准 Mobipocket 格式 |
| `.azw` / `.azw3` | Kindle 格式，与 MOBI 为同一容器结构，一并支持 |

## 五、验证结果

使用真实漫画文件 `[Kmoe][日月同錯]話001-005.mobi`（约 90 MB）实测：

- 成功提取 **226 页**（225 张 JPEG + 1 张 GIF）；
- 全部图片通过 `sharp` 完整解码校验，无损坏页；
- 解析耗时约 **0.5 秒**；
- 封面、目标页、页数等字段返回正常；
- `npx eslint fileLoader/mobi.js fileLoader/index.js` 无告警。

## 六、已知限制

- **纯文字 MOBI**（不含任何图片）会被跳过，并记录 `mobi file does not include image`，不影响书库中其它书籍的扫描；
- **带 DRM 的 Kindle 文件**若图片同样无法读取，按失败跳过；
- MOBI 为只读容器，**不支持在软件内删除其内嵌图片**（返回 `false`）。