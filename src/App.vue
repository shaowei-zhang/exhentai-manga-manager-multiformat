<template>
  <el-config-provider :locale="localeFile">
    <div id="progressbar" :style="{ width: progress + '%' }"></div>
    <el-button class="fullscreen-button" circle :icon="FullScreen" size="large" @click="switchFullscreen"></el-button>
    <el-row :gutter="20" class="book-search-bar">
      <el-col :span="1" :offset="2">
        <el-button type="primary" :icon="TreeViewAlt" plain @click="$refs.FolderTreeRef.openFolderTree()" :title="$t('m.folderTree')"></el-button>
      </el-col>
      <el-col :span="8">
        <el-autocomplete
          :model-value="searchString"
          :fetch-suggestions="querySearch"
          @keyup.enter="searchBook"
          @change="handleSearchStringChange"
          @input="handleInput"
          clearable
          :trigger-on-focus="false"
          class="search-input"
        >
          <template #default="{ item }">
            <span class="autocomplete-label">{{ item.label }}</span>
            <span class="autocomplete-value">{{ item.value }}</span>
          </template>
        </el-autocomplete>
      </el-col>
      <el-col :span="1">
        <el-button type="primary" :icon="Search32Filled" plain @click="searchBook" :title="$t('m.search')"></el-button>
      </el-col>
      <el-col :span="1">
        <el-button :icon="MdShuffle" plain @click="shuffleBook" :title="$t('m.shuffle')"></el-button>
      </el-col>
      <el-col :span="1">
        <el-button type="primary" :icon="MdRefresh" plain :title="$t('m.manualScan')"
          @click="loadBookList(true)" :loading="buttonLoadBookListLoading"></el-button>
      </el-col>
      <el-col :span="1">
        <el-button type="primary" :icon="MdCodeDownload" plain :title="$t('m.batchGetMetadata')"
          @click="getBookListMetadata()" :loading="buttonGetMetadatasLoading"></el-button>
      </el-col>
      <el-col :span="1">
        <el-button :icon="ArrowTrendingLines20Filled" plain @click="$refs.TagGraphRef.displayTagGraph()" :title="$t('m.tagAnalysis')"></el-button>
      </el-col>
      <el-col :span="1">
        <el-button :icon="SettingIcon" plain @click="$refs.SettingRef.dialogVisibleSetting = true" :title="$t('m.setting')"></el-button>
      </el-col>
      <el-col :span="3">
        <el-select :placeholder="$t('m.sort_filter')" @change="handleSortChange" clearable v-model="sortValue">
          <el-option-group :label="$t('m.filter')">
            <el-option :label="$t('m.all')" value=""></el-option>
            <el-option :label="$t('m.bookmarkOnly')" value="mark"></el-option>
            <el-option :label="$t('m.collectionOnly')" value="collection"></el-option>
            <el-option :label="$t('m.hiddenOnly')" value="hidden"></el-option>
            <el-option :label="$t('m.recentReadOnly')" value="recentRead"></el-option>
          </el-option-group>
          <el-option-group :label="$t('m.sort')">
            <el-option :label="$t('m.shuffle')" value="shuffle"></el-option>
            <el-option :label="$t('m.addTimeAscend')" value="addAscend"></el-option>
            <el-option :label="$t('m.addTimeDescend')" value="addDescend"></el-option>
            <el-option :label="$t('m.mtimeAscend')" value="mtimeAscend"></el-option>
            <el-option :label="$t('m.mtimeDescend')" value="mtimeDescend"></el-option>
            <el-option :label="$t('m.postTimeAscend')" value="postAscend"></el-option>
            <el-option :label="$t('m.postTimeDescend')" value="postDescend"></el-option>
            <el-option :label="$t('m.ratingAscend')" value="scoreAscend"></el-option>
            <el-option :label="$t('m.ratingDescend')" value="scoreDescend"></el-option>
            <el-option :label="$t('m.readCountAscend')" value="readCountAscend"></el-option>
            <el-option :label="$t('m.readCountDescend')" value="readCountDescend"></el-option>
            <el-option :label="$t('m.artistAscend')" value="artistAscend"></el-option>
            <el-option :label="$t('m.artistDescend')" value="artistDescend"></el-option>
            <el-option :label="$t('m.titleAscend')" value="titleAscend"></el-option>
            <el-option :label="$t('m.titleDescend')" value="titleDescend"></el-option>
            <el-option :label="$t('m.pageAscend')" value="pageAscend"></el-option>
            <el-option :label="$t('m.pageDescend')" value="pageDescend"></el-option>
          </el-option-group>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-row :gutter="20">
          <el-col :span="6"  v-if="!editTagView && !editCollectionView">
            <el-button plain @click="$refs.EditViewRef.enterEditCollectionView()" :icon="CicsSystemGroup" :title="$t('m.manageCollection')"></el-button>
          </el-col>
          <el-col :span="6" v-if="editCollectionView">
            <el-button type="primary" plain @click="$refs.EditViewRef.addCollection()" :icon="Collections24Regular" :title="$t('m.addCollection')"></el-button>
          </el-col>
          <el-col :span="6" v-if="editCollectionView">
            <el-button type="primary" plain @click="$refs.EditViewRef.editCollection()" :icon="Edit" :title="$t('m.editCollection')"></el-button>
          </el-col>
          <el-col :span="6" v-if="editCollectionView">
            <el-button type="primary" plain @click="$refs.EditViewRef.saveCollection()" :icon="Save16Regular" :title="$t('m.save')"></el-button>
          </el-col>
          <el-col :span="6" v-if="editCollectionView">
            <el-button type="primary" plain @click="$refs.EditViewRef.exitCollectionView()" :icon="MdExit" :title="$t('m.exit')"></el-button>
          </el-col>
          <el-col :span="6"  v-if="!editTagView && !editCollectionView">
            <el-button plain @click="$refs.EditViewRef.enterEditTagView()" :icon="TagGroup" :title="$t('m.manageTag')"></el-button>
          </el-col>
          <el-col :span="6" v-if="editTagView">
            <el-button type="primary" plain @click="$refs.EditViewRef.exitEditTagView()" :icon="MdExit" :title="$t('m.exit')"></el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <RandomTags
      ref="randomTagsRef"
      v-if="!editTagView && !editCollectionView && !setting.disableRandomTag"
      @search="handleSearchString"
    />
    <el-row :gutter="20" class="book-card-area">
      <el-col :span="24" v-if="!editTagView && !editCollectionView" class="book-card-list" :style="{height: setting.disableRandomTag ? 'calc(100vh - 96px)' : 'calc(100vh - 134px)'}">
        <div
          v-for="(book, index) in visibleChunkDisplayBookList"
          :key="book.id"
          class="book-card-frame"
          v-lazy:[book.id]="{'enter': loadBookCardContent, 'leave': unloadBookCardContent}"
          :tabindex="index + 1"
        >
          <transition name="pop">
            <!-- show book card when book isn't a collection, book isn't hidden because collected,
              and book isn't hidden by user except sorting by onlyHiddenBook
              and book isn't hidden by folder select -->
            <BookCard
              :book="book"
              v-if="!book.isCollection && !book.collectionHide && (sortValue === 'hidden' || !book.hiddenBook) && !book.folderHide && visibilityMap[book.id]"
              @open-book-detail="$refs.BookDetailDialogRef.openBookDetail(book)"
              @handle-click-cover="handleClickCover(book)"
              @on-book-context-menu="onBookContextMenu"
              @handle-search-string="handleSearchString"
              @search-from-tag="searchFromTag"
              @open-local-book="$refs.BookDetailDialogRef.openLocalBook(book)"
              @view-manga="$refs.InternalViewerRef.viewManga(book)"
            />
            <BookCardCollection
              :book="book"
              v-else-if="book.isCollection && !book.folderHide && visibilityMap[book.id]"
              @open-collection="openCollection(book)"
            />
          </transition>
        </div>
      </el-col>
      <EditView
        ref="EditViewRef"
        @preview-manga="previewManga"
        @search-from-tag="searchFromTag"
        @load-book-list="loadBookList"
        @get-books-metadata="(bookList, gap, callback) => $refs.SearchDialogRef.getBooksMetadata(bookList, gap, callback)"
        @handle-remove-book-display="handleRemoveBookDisplay"
      />
    </el-row>
    <el-row class="pagination-bar">
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:page-size="setting.pageSize"
        :page-sizes="[12, 24, 42, 72, 500, 5000, 1000000]"
        size="small"
        layout="total, sizes, prev, pager, next, jumper"
        :total="displayBookCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
        background
      />
    </el-row>
    <el-drawer v-model="drawerVisibleCollection"
      direction="btt"
      size="calc(100vh - 60px)"
      destroy-on-close
      class="collection-drawer"
    >
      <template #header>
        <div>
          <span class="open-collection-title">{{openCollectionTitle}}</span>
          <el-button type="primary" :icon="Edit" plain link class="collection-edit-button" @click="editCurrentCollection"/>
        </div>
      </template>
      <div class="collection-book-card-list">
        <div
          v-for="(book, index) in openCollectionBookList"
          :key="book.id"
          class="book-card-frame"
        >
          <BookCard
            :book="book"
            :tabindex="index + 1"
            @open-book-detail="$refs.BookDetailDialogRef.openBookDetail(book)"
            @handle-click-cover="handleClickCover(book)"
            @on-book-context-menu="onBookContextMenu"
            @handle-search-string="handleSearchString"
            @search-from-tag="searchFromTag"
            @open-local-book="$refs.BookDetailDialogRef.openLocalBook(book)"
            @view-manga="$refs.InternalViewerRef.viewManga(book)"
          />
        </div>
      </div>
    </el-drawer>
    <el-dialog v-model="moveFileDialogVisible" :title="$t('m.moveFile')" width="400px">
      <el-cascader
        v-model="moveFileTargetFolder"
        :options="folderTreeData"
        :props="{ checkStrictly: true }"
        filterable
        clearable
        style="width: 100%"
        :filter-method="filterFolderMethod"
        popper-class="book-tag-edit-cascader-popper"
      />
      <template #footer>
        <el-button @click="moveFileDialogVisible = false">{{$t('c.cancel')}}</el-button>
        <el-button type="primary" @click="confirmMoveFile">{{$t('m.move')}}</el-button>
      </template>
    </el-dialog>
    <BookDetailDialog
      ref="BookDetailDialogRef"
      @open-content-view="openContentView"
      @open-thumbnail-view="openThumbnailView"
      @save-collection="$refs.EditViewRef.saveCollection()"
      @handle-remove-book-display="handleRemoveBookDisplay"
      @open-search-dialog="$refs.SearchDialogRef.openSearchDialog(bookDetail)"
      @get-book-info="$refs.SearchDialogRef.getBookInfo(bookDetail)"
      @search-from-tag="searchFromTag"
      @jump-mange-detail="jumpMangeDetail"
      @add-to-history="addBookToHistory"
    />
    <InternalViewer
      ref="InternalViewerRef"
      @to-next-manga="toNextManga"
      @to-next-manga-random="toNextMangaRandom"
      @update-window-title="updateWindowTitle"
      @rescan-book="(book) => $refs.BookDetailDialogRef.rescanBook(book)"
    />
    <FolderTree ref="FolderTreeRef" @chunk-list="chunkList"/>
    <TagGraph ref="TagGraphRef" @search="handleSearchString"/>
    <SearchDialog ref="SearchDialogRef"/>
    <Setting ref="SettingRef" @load-book-list="loadBookList" @load-collection-list="loadCollectionList"/>
  </el-config-provider>
</template>

<script>
import { defineComponent } from 'vue'
import { Setting as SettingIcon, FullScreen, Edit } from '@element-plus/icons-vue'
import { ArrowTrendingLines20Filled, Collections24Regular, Search32Filled, Save16Regular } from '@vicons/fluent'
import { MdShuffle, MdRefresh, MdCodeDownload, MdExit } from '@vicons/ionicons4'
import { TreeViewAlt, CicsSystemGroup, TagGroup } from '@vicons/carbon'

import { getWidth, fetchRecentReads } from './utils.js'

import Setting from './components/Setting.vue'
import TagGraph from './components/TagGraph.vue'
import InternalViewer from './components/InternalViewer.vue'
import SearchDialog from './components/SearchDialog.vue'
import BookDetailDialog from './components/BookDetailDialog.vue'
import FolderTree from './components/FolderTree.vue'
import BookCard from './components/BookCard.vue'
import BookCardCollection from './components/BookCardCollection.vue'
import EditView from './components/EditView.vue'
import RandomTags from './components/RandomTags.vue'

import { mapWritableState, mapActions } from 'pinia'
import { useAppStore } from './pinia.js'

export default defineComponent({
  components: {
    Setting,
    TagGraph,
    InternalViewer,
    SearchDialog,
    BookDetailDialog,
    FolderTree,
    BookCard,
    BookCardCollection,
    EditView,
    RandomTags,
  },
  setup () {
    return {
      SettingIcon, FullScreen, Edit,
      Collections24Regular, Search32Filled, ArrowTrendingLines20Filled, Save16Regular,
      MdRefresh, MdCodeDownload, MdExit, MdShuffle,
      TreeViewAlt, CicsSystemGroup, TagGroup
    }
  },
  data () {
    return {
      // home
      searchString: '',
      currentPage_: 1,
      progress: 0,
      randomTags: [],
      visibilityMap: {},
      buttonLoadBookListLoading: false,
      buttonGetMetadatasLoading: false,
      actionHistory: [],
      // collection
      drawerVisibleCollection: false,
      openCollectionTitle: undefined,
      // move file
      moveFileDialogVisible: false,
      moveFileTargetBook: null,
      moveFileTargetFolder: null,
    }
  },
  computed: {
    ...mapWritableState(useAppStore, [
      'cat2letter',
      'keyMap',
      'categoryOption',
      'setting',
      'bookDetail',
      'bookList',
      'displayBookList',
      'chunkDisplayBookList',
      'collectionList',
      'openCollectionBookList',
      'serviceAvailable',
      'sortValue',
      'editCollectionView',
      'editTagView',
      'folderTreeData',
      'localeFile',
      'displayBookCount',
      'tagList',
      'tag2cat',
      'customOptions',
      'visibleChunkDisplayBookList',
    ]),
    currentPage: {
      get () {
        return this.currentPage_
      },
      set (val) {
        const pageLimit = Math.ceil(this.displayBookCount / this.setting.pageSize)
        if (Number.isInteger(val)) {
          if (val < 1) {
            this.currentPage_ = 1
          } else if (val > pageLimit) {
            this.currentPage_ = pageLimit
          } else {
            this.currentPage_ = val
          }
        }
      }
    },
  },
  mounted () {
    ipcRenderer.on('send-message', (event, arg) => {
      this.printMessage('info', arg)
      if (arg.includes('failed')) {
        console.error(arg)
      } else {
        console.log(arg)
      }
    })
    ipcRenderer.invoke('load-setting')
    .then(async (res) => {
      this.setting = res
      if (this.setting.loadOnStart) {
        // display exist books first then load new books
        await this.loadBookList()
        this.loadBookList(true)
      } else {
        this.loadBookList()
      }
    })
    this.sortValue = localStorage.getItem('sortValue')
    this.sortValue = this.sortValue === 'null' ? undefined : this.sortValue === 'undefined' ? undefined : this.sortValue
    window.addEventListener('keydown', this.resolveKey)
    window.addEventListener('wheel', this.resolveWheel)
    window.addEventListener('mousedown', this.resolveMouseDown)
    ipcRenderer.on('send-action', async (event, arg) => {
      switch (arg.action) {
        case 'setting':
          this.$refs.SettingRef.dialogVisibleSetting = true
          this.$refs.SettingRef.activeSettingPanel = 'general'
          break
        case 'about':
          this.$refs.SettingRef.dialogVisibleSetting = true
          this.$refs.SettingRef.activeSettingPanel = 'about'
          break
        case 'accelerator':
          this.$refs.SettingRef.dialogVisibleSetting = true
          this.$refs.SettingRef.activeSettingPanel = 'accelerator'
          break
        case 'send-progress':
          this.progress = +arg.progress > 1 ? 100 : +arg.progress < 0 ? 0 : +arg.progress * 100
          break
        case 'tag-fail-non-tag-book':
          if (this.currentUI() === 'home') {
            for (const book of this.displayBookList) {
              if (book.status === 'non-tag' && this.isBook(book) && this.isVisibleBook(book)) {
                book.status = 'tag-failed'
                await this.saveBook(book)
              }
            }
          }
          break
      }
    })
  },
  beforeUnmount () {
    window.removeEventListener('keydown', this.resolveKey)
    window.removeEventListener('wheel', this.resolveWheel)
    window.removeEventListener('mousedown', this.resolveMouseDown)
  },
  watch: {
    bookList () {
      this.handleSortChange(this.sortValue, this.bookList)
    },
  },
  methods: {
    ...mapActions(useAppStore, [
      'isBook',
      'isVisibleBook',
      'printMessage',
      'getDisplayTitle',
      'resetMetadata',
      'saveBook',
      'copyTagClipboard',
      'pasteTagClipboard',
      'filterFolderMethod',
    ]),

    // base function
    currentUI () {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return 'inputing'
      }
      if (!!document.querySelector('.is-message-box')) {
        return 'message-box'
      }
      if (this.$refs.SettingRef.dialogVisibleSetting) {
        return 'setting'
      }
      if (this.$refs.SearchDialogRef.dialogVisibleEhSearch) {
        return 'search-dialog'
      }
      if (this.$refs.InternalViewerRef.drawerVisibleViewer) {
        if (this.$refs.InternalViewerRef.showThumbnail) {
          return 'viewer-thumbnail'
        } else {
          return 'viewer-content'
        }
      }
      if (this.$refs.InternalViewerRef.isComicReadDisplay) {
        return 'viewer-comicread'
      }
      if (this.$refs.BookDetailDialogRef.dialogVisibleBookDetail) {
        if (this.$refs.BookDetailDialogRef.editingTag) {
          return 'edit-tag'
        } else {
          return 'bookdetail'
        }
      }
      if (this.$refs.TagGraphRef.dialogVisibleGraph) {
        return 'tag-graph'
      }
      if (this.$refs.FolderTreeRef.sideVisibleFolderTree) {
        return 'folder-tree'
      }
      if (this.$refs.EditViewRef.editCollectionView) {
        return 'edit-collection'
      }
      if (this.$refs.EditViewRef.editTagView) {
        return 'edit-group-tag'
      }
      if (this.drawerVisibleCollection) {
        return 'collection'
      }
      return 'home'
    },
    resolveKey (event) {
      let next, prev
      if (this.setting.reverseLeftRight) {
        ;({ next, prev } = this.keyMap.reverse)
      } else {
        ;({ next, prev } = this.keyMap.normal)
      }
      const currentUIValue = this.currentUI()
      const bookEachLine = Math.floor(getWidth(document.querySelector('.book-card-area div:first-child'), 'width') / getWidth(document.querySelector('.book-card'), 'full'))
      if (currentUIValue !== 'inputing') {
        if (event.key === 'Backspace') {
          document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))
          return
        }
      }
      if (currentUIValue === 'viewer-content' || currentUIValue === 'viewer-thumbnail') {
        if (event.key === 'PageDown') {
          if (event.shiftKey) {
            this.toNextMangaRandom()
          } else {
            this.toNextManga(1)
          }
        } else if (event.key === 'PageUp') {
          this.toNextManga(-1)
        } else if (event.key === '=') {
          this.$refs.InternalViewerRef.showThumbnail = !this.$refs.InternalViewerRef.showThumbnail
        }
        if (currentUIValue === 'viewer-content') {
          if (this.$refs.InternalViewerRef.imageStyleType === 'single' || this.$refs.InternalViewerRef.imageStyleType === 'double') {
            if (event.key === next || event.key === 'ArrowDown' || event.key === ' ') {
              this.$refs.InternalViewerRef.currentImageIndex += 1
            } else if (event.key === prev || event.key === 'ArrowUp') {
              this.$refs.InternalViewerRef.currentImageIndex -= 1
            } else if (event.key === 'Home') {
              this.$refs.InternalViewerRef.currentImageIndex = 0
            } else if (event.key === 'End') {
              if (this.$refs.InternalViewerRef.imageStyleType === 'single') {
                this.$refs.InternalViewerRef.currentImageIndex = this.$refs.InternalViewerRef.viewerImageList.length - 1
              } else if (this.$refs.InternalViewerRef.imageStyleType === 'double') {
                this.$refs.InternalViewerRef.currentImageIndex = this.$refs.InternalViewerRef.viewerImageListDouble.length - 1
              }
            }
            if (this.$refs.InternalViewerRef.imageStyleType === 'double') {
              if (event.key === "/") {
                this.$refs.InternalViewerRef.insertEmptyPageIndex = this.$refs.InternalViewerRef.currentImageIndex
                this.$refs.InternalViewerRef.insertEmptyPage = !this.$refs.InternalViewerRef.insertEmptyPage
              }
            }
          } else if (this.$refs.InternalViewerRef.imageStyleType === 'scroll') {
            if (event.key === prev || event.key === 'ArrowUp') {
              if (event.ctrlKey) {
                document.querySelector('.viewer-drawer .el-drawer__body').scrollBy(0, - window.innerHeight / 10)
              } else {
                document.querySelector('.viewer-drawer .el-drawer__body').scrollBy(0, - window.innerHeight / 1.2)
              }
            } else if (event.key === next || event.key === 'ArrowDown' || event.key === ' ') {
              if (event.ctrlKey) {
                document.querySelector('.viewer-drawer .el-drawer__body').scrollBy(0, window.innerHeight / 10)
              } else {
                document.querySelector('.viewer-drawer .el-drawer__body').scrollBy(0, window.innerHeight / 1.2)
              }
            } else if (event.key === 'Home') {
              document.querySelector('.viewer-drawer .el-drawer__body').scrollTop = 0
            } else if (event.key === 'End') {
              document.querySelector('.viewer-drawer .el-drawer__body').scrollTop = document.querySelector('.viewer-drawer .el-drawer__body').scrollHeight
            }
          }
        }
      } else if (currentUIValue === 'viewer-comicread') {
        // do nothing for now
      } else if (currentUIValue === 'bookdetail') {
        if (event.key === 'Enter') {
          event.preventDefault()
          this.$refs.InternalViewerRef.viewManga(this.bookDetail)
        } else if (event.key === "'") {
          this.$refs.BookDetailDialogRef.openLocalBook(this.bookDetail)
        } else if (event.key === 'Delete') {
          this.$refs.BookDetailDialogRef.deleteLocalBook(this.bookDetail)
        } else if (event.key === 'PageDown') {
          if (event.shiftKey) {
            this.jumpMangeDetailRandom()
          } else {
            this.jumpMangeDetail(1)
          }
        } else if (event.key === 'PageUp') {
          this.jumpMangeDetail(-1)
        }
      } else if (currentUIValue === 'home') {
        if (event.key === 'Enter') {
          event.preventDefault()
          document.activeElement.querySelector('.book-cover').click()
        } else if (event.key === 'F5') {
          this.loadBookList(true)
        } else if (event.key === 'F6' || (event.ctrlKey && event.key === 'l')) {
          document.querySelector('.search-input .el-input__inner').select()
        } else if (event.ctrlKey && event.key === 's') {
          this.shuffleBook()
        } else if (event.key === 'PageUp') {
          event.preventDefault()
          this.currentPage -= 1
          this.handleCurrentPageChange(this.currentPage)
        } else if (event.key === 'PageDown') {
          event.preventDefault()
          this.currentPage += 1
          this.handleCurrentPageChange(this.currentPage)
        } else if (event.key === 'ArrowDown') {
          event.preventDefault()
          this.jumpBookByTabindex(bookEachLine, '.book-card-area')
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          this.jumpBookByTabindex(-bookEachLine, '.book-card-area')
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          this.jumpBookByTabindex(-1, '.book-card-area')
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          this.jumpBookByTabindex(1, '.book-card-area')
        }
      } else if (currentUIValue === 'collection') {
        if (event.key === 'Enter') {
          document.activeElement.querySelector('.book-cover').click()
        } else if (event.key === 'ArrowDown') {
          this.jumpBookByTabindex(bookEachLine, '.collection-drawer')
        } else if (event.key === 'ArrowUp') {
          this.jumpBookByTabindex(-bookEachLine, '.collection-drawer')
        } else if (event.key === 'ArrowLeft') {
          this.jumpBookByTabindex(-1, '.collection-drawer')
        } else if (event.key === 'ArrowRight') {
          this.jumpBookByTabindex(1, '.collection-drawer')
        }
      }
    },
    resolveWheel (event) {
      if (event.ctrlKey) {
        const level = electronFunction['get-zoom-level']()
        if (event.deltaY > 0) {
          electronFunction['set-zoom-level'](level - 1)
        } else {
          electronFunction['set-zoom-level'](level + 1)
        }
      }
    },
    resolveMouseDown (event) {
      const currentUIValue = this.currentUI()
      if (event.button === 3) {
        if (currentUIValue === 'viewer-comicread') {
          this.$refs.InternalViewerRef.closeComicReader()
          return
        }
        document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))
        // clear search result when at home page
        if (currentUIValue === 'home') {
          this.handleSearchStringChange()
          this.$refs.FolderTreeRef.resetSelect()
        }
      } else if (event.button === 4) {
        if (currentUIValue !== 'viewer-content' && currentUIValue !== 'viewer-thumbnail' && currentUIValue !== 'viewer-comicread') {
          this.revertAction()
        }
      }
    },
    switchFullscreen () {
      ipcRenderer.invoke('switch-fullscreen')
    },
    customChunk (list, size, index) {
      const result = []
      let count = 0
      let countIndex = 0
      _.forEach(list, (book) => {
        if (countIndex === index) result.push(book)
        if (this.isVisibleBook(book)) count++
        if (count >= size) {
          countIndex++
          count = 0
        }
        if (countIndex > index) return false
      })
      return result
    },
    sortList(label) {
      return (a, b) => {
        if (_.get(a, label) && _.get(b, label)) {
          if (_.get(a, label) > _.get(b, label)) {
            return -1
          } else if (_.get(a, label) < _.get(b, label)) {
            return 1
          } else {
            return 0
          }
        } else if (_.get(a, label)) {
          return -1
        } else if (_.get(b, label)) {
          return 1
        } else {
          return 0
        }
      }
    },
    async loadBookList (scan) {
      try {
        this.buttonLoadBookListLoading = true
        const res = await ipcRenderer.invoke('load-book-list', scan)
        const bookList = this.prepareBookList(res)
        await this.loadCollectionList(bookList)
        this.bookList = bookList
        await this.$refs.FolderTreeRef.geneFolderTree()
        this.$refs.FolderTreeRef.resetSelect()
        this.$refs.EditViewRef.selectBookList = []
        this.buttonLoadBookListLoading = false
      } catch (error) {
        this.buttonLoadBookListLoading = false
        console.error(error)
      }
      if (scan) this.printMessage('success', this.$t('c.scanComplete'))
    },
    prepareBookList (bookList) {
      bookList.forEach(book => {
        if (Number.isInteger(book.filecount) && Number.isInteger(book.pageCount) && Math.abs(book.filecount - book.pageCount) > 5) book.pageDiff = true
      })
      return bookList
    },
    updateWindowTitle (book) {
      const title = this.getDisplayTitle(book)
      ipcRenderer.invoke('update-window-title', title)
    },

    // home header
    async getBookListMetadata () {
      try {
        this.buttonGetMetadatasLoading = true
        let bookList
        if (this.setting.batchTagfailedBook) {
          bookList = this.bookList.filter(book => book.status === 'tag-failed' || book.status === 'non-tag')
        } else {
          bookList = this.bookList.filter(book => book.status === 'non-tag')
        }
        if (this.setting.onlyGetMetadataOfSelectedFolder) {
          bookList = bookList.filter(book => !book.folderHide)
        }
        await this.$refs.SearchDialogRef.getBooksMetadata(bookList, this.setting.requireGap || 10000)
        this.buttonGetMetadatasLoading = false
      } catch (error) {
        this.buttonGetMetadatasLoading = false
        console.error(error)
      }
    },
    shuffleBook () {
      this.sortValue = 'shuffle'
      this.displayBookList = _.shuffle(this.displayBookList)
      this.chunkList()
    },
    handleSortChange (val, bookList) {
      if (!bookList) bookList = this.displayBookList
      switch(val){
        case 'mark':
          this.displayBookList = _.filter(this.bookList, 'mark')
          this.chunkList()
          break
        case 'collection':
          this.displayBookList = _.filter(this.bookList, 'isCollection')
          this.chunkList()
          break
        case 'hidden':
          this.displayBookList = _.filter(this.bookList, 'hiddenBook')
          this.chunkList()
          break
        case 'recentRead':
          const recentReads =  fetchRecentReads()
          this.displayBookList = _.uniqBy(
            recentReads.map(id => this.bookList.find(book => {
              if (book.collectionHide) return false
              if (book.isCollection) return book.ids.includes(id)
              return book.id === id
            }))
            .filter(book => book !== undefined),
            'id'
          )
          this.chunkList()
          break
        case 'shuffle':
          this.displayBookList = _.shuffle(bookList)
          this.chunkList()
          break
        case 'addAscend':
          this.displayBookList = bookList.toSorted(this.sortList('date')).toReversed()
          this.chunkList()
          break
        case 'addDescend':
          this.displayBookList = bookList.toSorted(this.sortList('date'))
          this.chunkList()
          break
        case 'mtimeAscend':
          this.displayBookList = bookList.toSorted(this.sortList('mtime')).toReversed()
          this.chunkList()
          break
        case 'mtimeDescend':
          this.displayBookList = bookList.toSorted(this.sortList('mtime'))
          this.chunkList()
          break
        case 'postAscend':
          this.displayBookList = bookList.toSorted(this.sortList('posted')).toReversed()
          this.chunkList()
          break
        case 'postDescend':
          this.displayBookList = bookList.toSorted(this.sortList('posted'))
          this.chunkList()
          break
        case 'scoreAscend':
          this.displayBookList = bookList.toSorted(this.sortList('rating')).toReversed()
          this.chunkList()
          break
        case 'scoreDescend':
          this.displayBookList = bookList.toSorted(this.sortList('rating'))
          this.chunkList()
          break
        case 'readCountAscend':
          this.displayBookList = bookList.toSorted(this.sortList('readCount')).toReversed()
          this.chunkList()
          break
        case 'readCountDescend':
          this.displayBookList = bookList.toSorted(this.sortList('readCount'))
          this.chunkList()
          break
        case 'artistAscend':
          this.displayBookList = bookList.toSorted(this.sortList('tags.artist')).toReversed()
          this.chunkList()
          break
        case 'artistDescend':
          this.displayBookList = bookList.toSorted(this.sortList('tags.artist'))
          this.chunkList()
          break
        case 'titleAscend':
          this.displayBookList = bookList.toSorted((a, b) => this.getDisplayTitle(b).localeCompare(this.getDisplayTitle(a), undefined, {numeric: true, sensitivity: 'base'})).toReversed()
          this.chunkList()
          break
        case 'titleDescend':
          this.displayBookList = bookList.toSorted((a, b) => this.getDisplayTitle(b).localeCompare(this.getDisplayTitle(a), undefined, {numeric: true, sensitivity: 'base'}))
          this.chunkList()
          break
        case 'pageAscend':
          this.displayBookList = bookList.toSorted(this.sortList('pageCount')).toReversed()
          this.chunkList()
          break
        case 'pageDescend':
          this.displayBookList = bookList.toSorted(this.sortList('pageCount'))
          this.chunkList()
          break
        default:
          this.displayBookList = this.bookList
          this.chunkList()
          break
      }
      localStorage.setItem('sortValue', val)
    },
    querySearch (queryString, callback) {
      let result = []
      const options = this.customOptions.concat(this.tagList)
      if (queryString) {
        const keywords = [...queryString.matchAll(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g)]
        if (!_.isEmpty(keywords)) {
          const nextKeyword = queryString.replace(/(~|-)?[\p{L}\d]+:"[- ._()\p{L}\d]+"\$/gu, '').trim()
          if (nextKeyword[0] === '-' || nextKeyword[0] === '~') {
            result = _.filter(options, (str) => {
              return _.includes(str.value.toLowerCase(), nextKeyword.slice(1).toLowerCase())
              || _.includes(str.label.toLowerCase(), nextKeyword.slice(1).toLowerCase())
            })
          } else {
            result = _.filter(options, (str) => {
              return _.includes(str.value.toLowerCase(), nextKeyword.toLowerCase())
              || _.includes(str.label.toLowerCase(), nextKeyword.toLowerCase())
            })
          }
        } else {
          if (queryString[0] === '-' || queryString[0] === '~') {
            result = _.filter(options, (str) => {
              return _.includes(str.value.toLowerCase(), queryString.slice(1).toLowerCase())
              || _.includes(str.label.toLowerCase(), queryString.slice(1).toLowerCase())
            })
          } else {
            result = _.filter(options, (str) => {
              return _.includes(str.value.toLowerCase(), queryString.toLowerCase())
              || _.includes(str.label.toLowerCase(), queryString.toLowerCase())
            })
          }
        }
      } else {
        result = options
      }
      callback(result)
    },
    handleSearchStringChange (val) {
      if (!val) {
        this.searchString = ''
        this.handleSortChange(this.sortValue, this.bookList)
      }
    },
    handleInput (val) {
      try {
        if (/^[\p{L}\d]+:"[- ._()\p{L}\d]+"\$$/u.test(val)
            && this.searchString.trim() !== val.trim()) {
          const keywords = [...this.searchString.trim().matchAll(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g)]
          if (!_.isEmpty(keywords)) {
            const keyword = this.searchString.replace(/(~|-)?[\p{L}\d]+:"[- ._()\p{L}\d]+"\$/gu, '').trim()
            const matches = this.searchString.match(/(~|-)?[\p{L}\d]+:"[- ._()\p{L}\d]+"\$/gu)
            if (keyword[0] === '-') {
              this.searchString = matches.concat([`-${val}`]).join(' ')
            } else if (keyword[0] === '~') {
              this.searchString = matches.concat([`~${val}`]).join(' ')
            } else {
              this.searchString = matches.concat([val]).join(' ')
            }
          } else {
            const keyword = this.searchString.trim()
            if (keyword[0] === '-') {
              this.searchString = `-${val}`
            } else if (keyword[0] === '~') {
              this.searchString = `~${val}`
            } else {
              this.searchString = val
            }
          }
        } else {
          this.searchString = val
          this.searchString = this.searchString.replace(/\|{3}/, ' ')
        }
      } catch {
        this.searchString = val
      }
    },
    searchBook (addToHistory = true) {
      const checkCondition = (bookString, bookInfo) => {
        const searchStringArray = this.searchString ? this.searchString.split(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/) : []
        const orCondition = _.filter(searchStringArray, (str) => str.startsWith('~'))
        const andCondition = _.filter(searchStringArray, (str) => !str.startsWith('~'))
        return _.some([andCondition, ...orCondition], (condition) => {
          if (_.isArray(condition)) {
            return _.every(condition, (str) => {
              try {
                if (_.startsWith(str, ':')) {
                  const type = str.slice(1, 6)
                  if (str[6] === '>') {
                    switch (type) {
                      case 'mtime':
                      case 'atime':
                      case 'ptime':
                        return bookInfo[type] >= new Date(str.slice(7))
                      case 'count':
                        return bookInfo[type] > parseInt(str.slice(7), 10)
                    }
                  } else if (str[6] === '<') {
                    switch (type) {
                      case 'mtime':
                      case 'atime':
                      case 'ptime':
                        return bookInfo[type] <= new Date(str.slice(7))
                      case 'count':
                        return bookInfo[type] < parseInt(str.slice(7), 10)
                    }
                  } else if (str[6] === '=') {
                    switch (type) {
                      case 'mtime':
                      case 'atime':
                      case 'ptime':
                        return bookInfo[type].toLocaleDateString() === new Date(str.slice(7)).toLocaleDateString()
                      case 'count':
                        return bookInfo[type] === parseInt(str.slice(7), 10)
                    }
                  } else {
                    return false
                  }
                } else if (_.startsWith(str, '-')) {
                  return !bookString.includes(str.slice(1).replace(/["']/g, '').replace(/[$]/g, '"').toLowerCase())
                } else {
                  return bookString.includes(str.replace(/["']/g, '').replace(/[$]/g, '"').toLowerCase())
                }
              } catch {
                return false
              }
            })
          } else {
            return bookString.includes(condition.slice(1).replace(/["']/g, '').replace(/[$]/g, '"').toLowerCase())
          }
        })
      }
      this.displayBookList = _.filter(this.bookList, (book) => {
        const bookString = JSON.stringify(
          _.assign(
            {},
            _.pick(book, ['title', 'title_jpn', 'status', 'filepath', 'url', 'pageDiff']),
            {
              tags: _.map(book.tags, (tags, cat) => {
                const letter = this.cat2letter[cat] ? this.cat2letter[cat] : cat
                return _.map(tags, (tag) => `${letter}:${tag}`).concat(_.map(tags, (tag) => `${cat}:${tag}`))
              }),
              category: `cat:${book.category}`,
            }
          )
        ).toLowerCase()
        const bookInfo = {
          mtime: new Date(book.mtime),
          atime: new Date(book.date),
          ptime: new Date(book.posted * 1000),
          count: book.readCount
        }
        return checkCondition(bookString, bookInfo)
      })
      if (!this.sortValue || ['mark', 'hidden', 'collection'].includes(this.sortValue)) this.sortValue = 'addDescend'
      this.handleSortChange(this.sortValue, this.displayBookList)
      if (this.currentUI() === 'edit-group-tag') {
        this.$refs.EditViewRef.selectBookList = []
        this.displayBookList.forEach(book => book.selected = false)
      } else if (addToHistory) {
        this.actionHistory.push({type: 'search', value: this.searchString})
      }
    },
    handleSearchString (string) {
      this.$refs.BookDetailDialogRef.dialogVisibleBookDetail = false
      this.drawerVisibleCollection = false
      this.searchString = string
      this.searchBook()
    },
    revertAction () {
      let action = this.actionHistory.pop()
      switch (action?.type) {
        case 'search':
          if (action?.value === this.searchString && this.currentUI() === 'home') {
            this.revertAction()
            return
          }
          if (action?.value !== undefined) {
            this.$refs.BookDetailDialogRef.dialogVisibleBookDetail = false
            this.drawerVisibleCollection = false
            this.searchString = action.value
            this.searchBook(false)
          }
          break
        case 'openBook':
          if (action?.value === this.bookDetail?.id && this.currentUI() === 'bookdetail') {
            this.revertAction()
            return
          }
          if (action?.value !== undefined) {
            const book = this.bookList.find(b => b.id === action.value)
            if (book) this.$refs.BookDetailDialogRef.openBookDetail(book, false)
          }
          break
        default:
          this.$refs.BookDetailDialogRef.dialogVisibleBookDetail = false
          this.handleSearchStringChange()
          this.printMessage('info', this.$t('c.noMoreActionHistory'))
          break
      }
    },
    searchFromTag (tag, cat) {
      this.$refs.BookDetailDialogRef.dialogVisibleBookDetail = false
      this.drawerVisibleCollection = false
      if (cat) {
        const letter = this.cat2letter[cat] ? this.cat2letter[cat] : cat
        this.searchString = `${letter}:"${tag}"$`
      } else {
        this.searchString = `"${tag}"$`
      }
      this.searchBook()
    },
    // home main
    handleClickCover (book) {
      switch (this.setting.directEnter) {
        case 'internalViewer':
          this.$refs.InternalViewerRef.viewManga(book)
          break
        case 'externalViewer':
          this.$refs.BookDetailDialogRef.openLocalBook(book)
          break
        default:
          this.$refs.BookDetailDialogRef.openBookDetail(book)
          break
      }
    },
    addBookToHistory (id) {
      if (id) this.actionHistory.push({type: 'openBook', value: id})
    },
    jumpBookByTabindex (step, container) {
      try {
        const activeElement = document.activeElement
        if (!document.querySelector(container).contains(activeElement)) {
          throw new Error('active element not in container')
        }
        const tabIndexNow = activeElement.getAttribute('tabindex')
        const tabIndexNext = parseInt(tabIndexNow, 10) + step
        if (!(tabIndexNext >= 1)) throw new Error('detect illegal tabindex')
        document.querySelector(`${container} div[tabindex="${tabIndexNext}"]`).focus()
      } catch (error) {
        console.log(error)
        document.querySelector(`${container} div[tabindex="1"]`).focus()
      }
    },
    loadBookCardContent (id) {
      this.visibilityMap[id] = true
    },
    unloadBookCardContent (id) {
      this.visibilityMap[id] = false
    },
    chunkList () {
      this.currentPage = 1
      this.chunkDisplayBookList = this.customChunk(this.displayBookList, this.setting.pageSize, 0)
      this.scrollMainPageTop()
    },
    handleSizeChange () {
      this.chunkList()
      this.$refs.SettingRef.saveSetting()
      this.scrollMainPageTop()
    },
    handleCurrentPageChange (currentPage) {
      this.visibilityMap = {}
      this.chunkDisplayBookList = this.customChunk(this.displayBookList, this.setting.pageSize, currentPage - 1)
      this.scrollMainPageTop()
    },
    scrollMainPageTop () {
      document.getElementsByClassName('book-card-area')[0].scrollTop = 0
    },

    async getMetadataFromClipboardLink (book) {
      const text = await ipcRenderer.invoke('read-text-from-clipboard')
      const url = text.trim()
      if (url) {
        book.url = url
        this.$refs.SearchDialogRef.getBookInfo(book)
      }
    },
    onBookContextMenu (e, book) {
      e.preventDefault()
      this.$contextmenu({
        x: e.x,
        y: e.y,
        items: [
          {
            label: this.$t('m.getMetadata'),
            onClick: () => {
              this.$refs.SearchDialogRef.openSearchDialog(book)
            }
          },
          {
            label: this.$t('m.resetMetadata'),
            onClick: () => {
              this.resetMetadata(book)
            }
          },
          {
            label: this.$t('m.openMangaFileLocation'),
            onClick: () => {
              this.$refs.BookDetailDialogRef.showFile(book.filepath)
            }
          },
          {
            label: this.$t('m.moveFile'),
            onClick: () => {
              this.handleMoveFile(book)
            }
          },
          {
            label: this.$t('m.deleteFile'),
            onClick: () => {
              this.$refs.BookDetailDialogRef.deleteLocalBook(book)
            }
          },
          {
            label: this.$t('m.hideManga') + "/" + this.$t('m.showManga'),
            onClick: () => {
              this.$refs.BookDetailDialogRef.triggerHiddenBook(book)
            }
          },
          {
            label: this.$t('m.copyTagClipboard'),
            onClick: () => {
              this.copyTagClipboard(book)
            }
          },
          {
            label: this.$t('m.pasteTagClipboard'),
            onClick: () => {
              this.pasteTagClipboard(book)
            }
          },
          {
            label: this.$t('m.getMetadataFromClipboardLink'),
            onClick: () => {
              this.getMetadataFromClipboardLink(book)
            }
          },
        ]
      })
    },

    handleMoveFile (book) {
      this.moveFileTargetBook = book
      this.moveFileTargetFolder = null
      this.moveFileDialogVisible = true
    },
    async confirmMoveFile () {
      if (!this.moveFileTargetBook || !this.moveFileTargetFolder) {
        this.printMessage('error', this.$t('c.moveError'))
        return
      }
      try {
        const newFilePath = await ipcRenderer.invoke('move-local-book', this.moveFileTargetBook.filepath, _.cloneDeep(this.moveFileTargetFolder))
        if (newFilePath) {
          this.moveFileTargetBook.filepath = newFilePath
          await this.saveBook(this.moveFileTargetBook)
        }
      } catch (e) {
        console.error(e)
      }
      this.moveFileDialogVisible = false
      this.moveFileTargetBook = null
      this.moveFileTargetFolder = null
    },

    // collection view function
    async loadCollectionList (bookList = null) {
      if (!bookList) {
        bookList = this.bookList
      }
      this.collectionList = await ipcRenderer.invoke('load-collection-list')

      // 创建查找映射表，避免重复遍历
      const bookMap = new Map(bookList.flatMap(book => [[book.hash, book], [book.id, book]]))

      _.forEach(this.collectionList, collection => {
        let collectBook = _.compact(collection.list.map(hash_id => {
          return bookMap.get(hash_id)
        }))
        collectBook = _.flatten(collectBook)
        collection.list = [...new Set(collectBook.map(book => book.hash))]
        collectBook.forEach(book => book.collectionHide = true)
        const date = _.last(_.compact(_.sortBy(collectBook.map(book => book.date))))
        const posted = _.last(_.compact(_.sortBy(collectBook.map(book => book.posted))))
        const rating = _.last(_.compact(_.sortBy(collectBook.map(book => book.rating))))
        const mtime = _.last(_.compact(_.sortBy(collectBook.map(book => book.mtime))))
        const mark = _.some(collectBook, 'mark')
        const pageDiff = _.some(collectBook, 'pageDiff') ? true : undefined
        const readCount = _.max(collectBook.map(book => book.readCount))
        const pageCount = _.sum(collectBook.map(book => book.pageCount))
        const tags = _.mergeWith({}, ...collectBook.map(book => book.tags), (obj, src) => {
          if (_.isArray(obj) && _.isArray(src)) {
            return [...new Set(obj.concat(src))]
          } else {
            return src
          }
        })
        const ids = collectBook.map(book => book.id)
        const title_jpn = collectBook.map(book => book.title+book.title_jpn).join(',')
        const filepath = collectBook.map(book => book.filepath).join(',')
        const category = [...new Set(collectBook.map(book => book.category))].join(',')
        const status = [...new Set(collectBook.map(book => book.status))].join(',')
        if (!_.isEmpty(collectBook)) {
          bookList.push({
            title: collection.title,
            id: collection.id,
            coverPath: collectBook?.[0]?.coverPath,
            date, posted, rating, mtime, mark, tags, title_jpn, category, status, pageDiff, readCount, pageCount,
            list: collection.list,
            filepath,
            isCollection: true,
            chapterCount: collection?.list?.length,
            ids,
          })
        }
      })
    },
    openCollection (collection) {
      this.drawerVisibleCollection = true
      this.openCollectionBookList = _.compact(_.flatten(collection.list.map(hash_id => {
        return _.filter(this.bookList, book => book.id === hash_id || book.hash === hash_id)
      })))
      this.openCollectionTitle = collection.title
      this.$refs.EditViewRef.selectCollection = collection.id
    },
    editCurrentCollection () {
      this.drawerVisibleCollection = false
      this.$refs.EditViewRef.editCollectionView = true
      this.$refs.EditViewRef.handleSelectCollectionChange(this.$refs.EditViewRef.selectCollection)
    },
    previewManga (book) {
      this.$refs.InternalViewerRef.showThumbnail = true
      this.$refs.InternalViewerRef.viewManga(book, '83%')
    },

    // bookDetailView
    jumpMangeDetail (step) {
      const activeBookList = this.drawerVisibleCollection ? this.openCollectionBookList : _.filter(this.displayBookList, book => this.isBook(book) && this.isVisibleBook(book))
      const indexNow = _.findIndex(activeBookList, {id: this.bookDetail.id})
      const indexNext = indexNow + step
      if (indexNext >= 0 && indexNext < activeBookList.length) {
        this.$refs.BookDetailDialogRef.openBookDetail(activeBookList[indexNext])
      } else {
        this.printMessage('info', this.$t('c.outOfRange'))
      }
    },
    jumpMangeDetailRandom () {
      const activeBookList = this.drawerVisibleCollection ? this.openCollectionBookList : _.filter(this.displayBookList, book => this.isBook(book) && this.isVisibleBook(book))
      this.$refs.BookDetailDialogRef.openBookDetail(_.sample(activeBookList))
    },
    openContentView (book) {
      this.$refs.InternalViewerRef.showThumbnail = false
      this.$refs.InternalViewerRef.viewManga(book)
    },
    openThumbnailView (book) {
      this.$refs.InternalViewerRef.showThumbnail = true
      this.$refs.InternalViewerRef.viewManga(book)
    },
    handleRemoveBookDisplay () {
      this.chunkDisplayBookList = this.customChunk(this.displayBookList, this.setting.pageSize, this.currentPage - 1)
    },

    // internal viewer
    toNextManga (step) {
      this.$refs.InternalViewerRef.handleStopReadManga()
      const activeBookList = this.drawerVisibleCollection ? this.openCollectionBookList : _.filter(this.displayBookList, book => this.isBook(book) && this.isVisibleBook(book))
      const indexNow = _.findIndex(activeBookList, {id: this.bookDetail.id})
      const indexNext = indexNow + step
      if (indexNext >= 0 && indexNext < activeBookList.length) {
        const selectBook = activeBookList[indexNext]
        setTimeout(() => {
          this.bookDetail = selectBook
          this.$refs.InternalViewerRef.viewManga(selectBook)
          this.comments = []
          if (this.setting.showComment) this.getComments(selectBook.url)
        }, 500)
      } else {
        this.printMessage('info', this.$t('c.outOfRange'))
      }
    },
    toNextMangaRandom () {
      this.$refs.InternalViewerRef.handleStopReadManga()
      const activeBookList = this.drawerVisibleCollection ? this.openCollectionBookList : _.filter(this.displayBookList, book => this.isBook(book) && this.isVisibleBook(book))
      const selectBook = _.sample(activeBookList)
      setTimeout(() => {
        this.bookDetail = selectBook
        this.$refs.InternalViewerRef.viewManga(selectBook)
        this.comments = []
        if (this.setting.showComment) this.getComments(selectBook.url)
      }, 500)
    },
  }
})
</script>
<style lang='stylus'>
body
  margin: auto
  width: calc(100vw - 20px)
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  text-align: center
  margin-top: 20px

@keyframes striped-flow
  0%
    background-position: -100%
  to
    background-position: 100%

.pop-enter-active, .pop-leave-active
  transition: opacity 0.3s ease

.pop-enter-from, .pop-leave-to
  opacity: 0

#progressbar
  position: fixed
  top: 0
  left: 0
  height: 4px
  background-color: #67C23A
  background-image: linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)
  background-size: 2em 2em
  animation: striped-flow 3s linear infinite
  animation-duration: 30s
  border-radius: 2px


.fullscreen-button
  position: absolute
  top: 39px
  left: calc(50vw - 22px)
  border-width: 0
  opacity: 0
  z-index: 3000!important
  .el-icon
    width: 20px
    svg
      height: 20px
      width: 20px
.fullscreen-button:hover
  opacity: 1
  background-color: #ffffff66

.search-input,
.function-button
  width: 100%
.autocomplete-value
  margin-left: 2em
  float: right

// search-input sort-select
.el-autocomplete-suggestion__wrap, .el-select-dropdown__wrap
  max-height: 490px!important

.book-tag-edit-cascader-popper
  .el-cascader-menu__wrap.el-scrollbar__wrap
    height: 340px

.pagination-bar
  margin: 4px 0
  justify-content: center
  .el-pagination--small .el-select
    width: 110px
    .el-select__wrapper
      text-align: center

.book-card-area
  overflow-x: auto
  justify-content: center
  margin-top: 8px
  .book-card-list
    height: calc(100vh - 96px)
    display: flex
    flex-wrap: wrap
    justify-content: center
    align-content: flex-start

.book-card-frame
  min-width: 234px
  min-height: 383px
  display: inline-block

.collection-book-card-list
  display: flex
  flex-wrap: wrap
  justify-content: center
  align-content: flex-start

.open-collection-title
  margin: 0 4px
.collection-edit-button
  margin-bottom: 2px


.mx-menu-ghost-host
  z-index: 5000!important
.mx-context-menu
  background-color: var(--el-fill-color-extra-light)!important
  .mx-context-menu-item:hover
    background-color: var(--el-fill-color-dark)
    color: var(--el-text-color-regular)
  .mx-context-menu-item
    padding: 6px
    color: var(--el-text-color-regular)

html.light
  color-scheme: light

html.exhentai
  background-color: #34353b
  --el-bg-color: #34353b
  --el-bg-color-overlay: #34353b
  --el-color-primary: #909399
  --el-color-primary-light-3: #6b6d71
  --el-color-primary-light-5: #525457
  --el-color-primary-light-7: #393a3c
  --el-color-primary-light-8: #2d2d2f
  --el-color-primary-light-9: #383838
  --el-color-primary-dark-2: #a6a9ad
  --el-color-warning-light-9: #433827
  --el-color-danger-light-9: #493333
  --el-color-success-light-9: #303927
  --el-color-info-light-9: #383838
  --el-fill-color-light: #3d414b
  --el-fill-color-extra-light: #3d414b
  --el-fill-color-dark: #50535b
  --el-border-color: #6e6e6e

html.e-hentai
  background-color: #e2e0d2
  --el-bg-color: #e2e0d2
  --el-bg-color-overlay: #e2e0d2
  --el-color-primary: #521613
  --el-color-primary-light-3: #eebe77
  --el-color-primary-light-5: #9d702e
  --el-color-primary-light-7: #f8e3c5
  --el-color-primary-light-8: #faecd8
  --el-color-primary-light-9: #fdf6ec
  --el-color-primary-dark-2: #b88230
  --el-fill-color-light: #edebe0
  --el-fill-color-extra-light: #edebe0
  --el-fill-color-dark: #fefcf4
  --el-fill-color-blank: #e2e0d2
  --el-border-color: #919191

html.nhentai
  background-color: #0d0d0d
  --el-bg-color: #0d0d0d
  --el-bg-color-overlay: #0d0d0d
  --el-color-primary: #d54255
  --el-color-primary-light-3: #b25252
  --el-color-primary-light-5: #854040
  --el-color-primary-light-7: #582e2e
  --el-color-primary-light-8: #412626
  --el-color-primary-light-9: #493333
  --el-color-primary-dark-2: #f78989
  --el-color-warning-light-9: #433827
  --el-color-danger-light-9: #493333
  --el-color-success-light-9: #303927
  --el-color-info-light-9: #383838
  --el-fill-color-light: #1f1f1f
  --el-fill-color-extra-light: #1f1f1f
  --el-fill-color-dark: #666666
  --el-border-color: #6e6e6e

// ============================================================
// Aurora 主题：紫蓝黑红渐变 / 大圆角 / 通透玻璃质感
// 通过 html.aurora 生效，可与任意浅色/深色主题风格切换
// ============================================================
html.aurora
  color-scheme: dark
  --aurora-violet: #8b5cf6
  --aurora-blue: #3b82f6
  --aurora-red: #ff4d6d
  --aurora-grad: linear-gradient(135deg, #8b5cf6, #3b82f6)
  --aurora-grad-accent: linear-gradient(120deg, #8b5cf6, #3b82f6 48%, #ff4d6d)
  --aurora-panel: rgba(30, 21, 56, 0.55)
  --aurora-panel-solid: rgba(22, 15, 42, 0.88)
  --aurora-border: rgba(148, 120, 255, 0.22)
  --aurora-border-strong: rgba(148, 120, 255, 0.5)
  --aurora-glow: 0 20px 44px -22px rgba(124, 92, 255, 0.6)
  --aurora-radius-lg: 22px
  --aurora-radius-md: 14px
  --aurora-radius-sm: 10px

  --el-bg-color: #0c0918
  --el-bg-color-overlay: rgba(24, 16, 44, 0.96)
  --el-bg-color-page: #0c0918
  --el-fill-color-blank: transparent
  --el-fill-color: rgba(148, 120, 255, 0.08)
  --el-fill-color-light: rgba(148, 120, 255, 0.1)
  --el-fill-color-extra-light: rgba(148, 120, 255, 0.07)
  --el-fill-color-dark: rgba(148, 120, 255, 0.18)
  --el-color-primary: #8b5cf6
  --el-color-primary-light-3: #a184ff
  --el-color-primary-light-5: #b9a4ff
  --el-color-primary-light-7: #d2c6ff
  --el-color-primary-light-8: #e2dbff
  --el-color-primary-light-9: rgba(139, 92, 246, 0.18)
  --el-color-primary-dark-2: #6d43e0
  --el-color-success: #3b82f6
  --el-color-danger: #ff4d6d
  --el-color-warning: #f0a24b
  --el-color-info: #9a91bf
  --el-text-color-primary: #ece8ff
  --el-text-color-regular: #c9c2e6
  --el-text-color-secondary: #9a91bf
  --el-text-color-placeholder: #7d75a3
  --el-border-color: rgba(148, 120, 255, 0.22)
  --el-border-color-light: rgba(148, 120, 255, 0.16)
  --el-border-color-lighter: rgba(148, 120, 255, 0.12)
  --el-border-color-extra-light: rgba(148, 120, 255, 0.08)
  --el-border-radius-base: 12px
  --el-border-radius-small: 10px
  --el-border-radius-round: 999px
  --el-box-shadow: 0 20px 48px -24px rgba(0, 0, 0, 0.85)
  --el-box-shadow-light: 0 14px 32px -20px rgba(0, 0, 0, 0.75)
  --el-mask-color: rgba(8, 5, 18, 0.72)

  // 页面底色：紫 / 蓝 / 红三处柔光叠加在近黑底上
  background: radial-gradient(1200px 820px at 10% -12%, rgba(139, 92, 246, 0.3), transparent 60%), radial-gradient(900px 720px at 90% -4%, rgba(59, 130, 246, 0.24), transparent 56%), radial-gradient(1100px 900px at 50% 122%, rgba(255, 77, 109, 0.16), transparent 62%), #08060f
  background-attachment: fixed

  body
    background: transparent

  // ---------- 滚动条 ----------
  ::-webkit-scrollbar
    width: 10px
    height: 10px
  ::-webkit-scrollbar-thumb
    background: linear-gradient(180deg, rgba(139, 92, 246, 0.75), rgba(59, 130, 246, 0.75))
    border-radius: 999px
    border: 2px solid transparent
    background-clip: padding-box
  ::-webkit-scrollbar-thumb:hover
    background: linear-gradient(180deg, #8b5cf6, #3b82f6)
    background-clip: padding-box
  ::-webkit-scrollbar-track
    background: transparent

  // ---------- 顶部进度条 ----------
  #progressbar
    background-color: transparent
    background-image: var(--aurora-grad-accent)
    border-radius: 999px
    box-shadow: 0 0 16px rgba(139, 92, 246, 0.8)

  // ---------- 搜索/工具条 ----------
  .book-search-bar
    margin: 10px auto 0
    padding: 12px 10px
    width: calc(100% - 24px)
    border-radius: 999px
    background: var(--aurora-panel)
    border: 1px solid var(--aurora-border)
    backdrop-filter: blur(18px)
    box-shadow: var(--aurora-glow)

  .fullscreen-button:hover
    background-color: rgba(139, 92, 246, 0.22)
    border-radius: 999px

  // ---------- 通用控件：圆角 + 通透 ----------
  .el-button
    border-radius: var(--aurora-radius-md)
    border-color: var(--aurora-border)
    transition: transform 0.2s ease, background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease
  .el-button:hover
    transform: translateY(-1px)
  .el-button--primary:not(.is-plain):not(.is-link):not(.is-text)
    border: 0
    background-image: var(--aurora-grad)
    box-shadow: 0 12px 24px -14px rgba(124, 92, 255, 0.95)
  .el-button--primary.is-plain
    background: rgba(148, 120, 255, 0.1)
  .el-button.is-circle
    border-radius: 999px
  .el-button-group .el-button:first-child
    border-radius: var(--aurora-radius-md) 0 0 var(--aurora-radius-md)
  .el-button-group .el-button:last-child
    border-radius: 0 var(--aurora-radius-md) var(--aurora-radius-md) 0

  .el-input__wrapper, .el-textarea__inner, .el-select__wrapper
    border-radius: var(--aurora-radius-md)
    background: rgba(18, 12, 36, 0.6)
    box-shadow: 0 0 0 1px var(--aurora-border) inset
    transition: box-shadow 0.25s ease, background 0.25s ease
  .el-input__wrapper.is-focus, .el-select__wrapper.is-focused, .el-textarea__inner:focus
    background: rgba(22, 15, 44, 0.75)
    box-shadow: 0 0 0 1px var(--aurora-border-strong) inset, 0 0 0 4px rgba(139, 92, 246, 0.16)

  // NameFormItem 组合控件（标签 + 输入）：只圆外侧角，两半无缝拼接且左右半径一致
  .name-select__prepend
    border: 1px solid var(--aurora-border)
    border-right: 0
    border-radius: var(--aurora-radius-md) 0 0 var(--aurora-radius-md)
    background: rgba(148, 120, 255, 0.08)
    color: var(--el-text-color-secondary)
    box-shadow: none
  .name-select__append
    border: 1px solid var(--aurora-border)
    border-left: 0
    border-radius: 0 var(--aurora-radius-md) var(--aurora-radius-md) 0
    background: rgba(148, 120, 255, 0.08)
    color: var(--el-text-color-secondary)
    box-shadow: none
  // 拼接处不画内侧线，两半共用一条外轮廓，视觉上是一个整体
  .name-select__body.has-prepend .el-input__wrapper,
  .name-select__body.has-prepend .el-select__wrapper
    border-top-left-radius: 0
    border-bottom-left-radius: 0
    box-shadow: inset 0 1px 0 var(--aurora-border), inset 0 -1px 0 var(--aurora-border), inset -1px 0 0 var(--aurora-border)
  .name-select__body.has-append .el-input__wrapper,
  .name-select__body.has-append .el-select__wrapper
    border-top-right-radius: 0
    border-bottom-right-radius: 0
    box-shadow: inset 0 1px 0 var(--aurora-border), inset 0 -1px 0 var(--aurora-border), inset 1px 0 0 var(--aurora-border)
  .name-select__body.has-prepend.has-append .el-input__wrapper,
  .name-select__body.has-prepend.has-append .el-select__wrapper
    border-radius: 0
    box-shadow: inset 0 1px 0 var(--aurora-border), inset 0 -1px 0 var(--aurora-border)
  .name-select__body.has-prepend .el-textarea__inner
    border-top-left-radius: 0
    border-bottom-left-radius: 0
    box-shadow: inset 0 1px 0 var(--aurora-border), inset 0 -1px 0 var(--aurora-border), inset -1px 0 0 var(--aurora-border)
  .name-select__body.has-append .el-textarea__inner
    border-top-right-radius: 0
    border-bottom-right-radius: 0
    box-shadow: inset 0 1px 0 var(--aurora-border), inset 0 -1px 0 var(--aurora-border), inset 1px 0 0 var(--aurora-border)
  .name-select__body.has-prepend.has-append .el-textarea__inner
    border-radius: 0
    box-shadow: inset 0 1px 0 var(--aurora-border), inset 0 -1px 0 var(--aurora-border)

  // 原生 el-input 的 prepend/append 同样处理
  .el-input-group__prepend
    border-radius: var(--aurora-radius-md) 0 0 var(--aurora-radius-md)
    background: rgba(148, 120, 255, 0.08)
    box-shadow: 0 0 0 1px var(--aurora-border) inset
    border: 0
  .el-input-group__append
    border-radius: 0 var(--aurora-radius-md) var(--aurora-radius-md) 0
    background: rgba(148, 120, 255, 0.08)
    box-shadow: 0 0 0 1px var(--aurora-border) inset
    border: 0
  .el-input-group--prepend .el-input__wrapper
    border-top-left-radius: 0
    border-bottom-left-radius: 0
  .el-input-group--append .el-input__wrapper
    border-top-right-radius: 0
    border-bottom-right-radius: 0
  .el-input-group--prepend.el-input-group--append .el-input__wrapper
    border-radius: 0

  .el-tag
    border-radius: 999px
    border-width: 0
    backdrop-filter: blur(4px)

  .el-rate__icon
    filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.45))

  // ---------- 卡片 / 弹窗 / 抽屉：玻璃质感 ----------
  .el-card, .el-dialog, .el-drawer
    border-radius: var(--aurora-radius-lg)
    border: 1px solid var(--aurora-border)
    background: var(--aurora-panel-solid)
    backdrop-filter: blur(22px)
    box-shadow: var(--aurora-glow)
    overflow: hidden
  .el-dialog__header, .el-drawer__header
    margin-right: 0
    padding-bottom: 16px
    border-bottom: 1px solid var(--aurora-border)
  .el-message-box
    border-radius: var(--aurora-radius-lg)
    border: 1px solid var(--aurora-border)
    background: var(--aurora-panel-solid)
    backdrop-filter: blur(22px)
  .el-overlay
    backdrop-filter: blur(2px)
  .el-popper.is-light, .el-select-dropdown, .el-autocomplete-suggestion
    border-radius: var(--aurora-radius-md)
    border: 1px solid var(--aurora-border)
    background: var(--aurora-panel-solid)
    backdrop-filter: blur(18px)
    box-shadow: var(--aurora-glow)
  .el-dropdown-menu
    border-radius: var(--aurora-radius-md)
    padding: 6px

  // ---------- 分页 ----------
  .pagination-bar
    .el-pagination.is-background .btn-prev, .el-pagination.is-background .btn-next, .el-pagination.is-background .el-pager li
      border-radius: 999px
    .el-pagination.is-background .el-pager li.is-active
      background-image: var(--aurora-grad)
      box-shadow: 0 8px 18px -10px rgba(124, 92, 255, 0.95)

  // ---------- 书籍卡片 ----------
  .book-card
    border-radius: var(--aurora-radius-lg)
    border: 1px solid var(--aurora-border)
    background: linear-gradient(160deg, rgba(44, 31, 78, 0.72), rgba(17, 11, 33, 0.78))
    backdrop-filter: blur(14px)
    box-shadow: 0 18px 38px -26px rgba(0, 0, 0, 0.95)
    overflow: hidden
    transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease
  .book-card::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    height: 3px
    background: var(--aurora-grad-accent)
    opacity: 0.9
  .book-card:hover
    transform: translateY(-6px)
    border-color: var(--aurora-border-strong)
    box-shadow: 0 30px 54px -24px rgba(124, 92, 255, 0.75)
  .book-card .book-cover
    border-radius: var(--aurora-radius-md)
    box-shadow: 0 10px 24px -16px rgba(0, 0, 0, 0.9)
  .book-card .book-title
    color: var(--el-text-color-primary)
    font-weight: 600
  .book-card .book-card-language, .book-card .book-card-pagecount
    border-radius: 999px
  .book-card .book-status-tag
    border-radius: 999px
</style>