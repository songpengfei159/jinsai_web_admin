<template>
  <div id="table" class="app-container calendar-list-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0">
      <el-button v-permission="'/picture/add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">添加</el-button>
      <el-button class="button" type="primary" icon="el-icon-refresh" @click="checkAll()" >{{ chooseTitle }}</el-button>
      <el-button v-permission="'/picture/delete'" class="filter-item" type="danger" icon="el-icon-delete" @click="handleDeleteBatch" >删除选中</el-button>
    </div>

    <el-tabs v-model="activeName" type="border-card" tab-position="left" style="height: 800px; width: 100%" @tab-click="clickTab">
      <el-tab-pane v-for="(resourceSort, index) in resourceSorts" :key="index" style="height: 800px; width: 100%; overflow: auto">
        <div slot="label" class="sortItem" style="float: left">
          <i class="el-icon-folder" />
          {{ resourceSort.sortName }}
        </div>
        <el-row>
          <el-col v-for="(resource, index) in resourceSort.resources" :key="resource.uid" :xs="4" :sm="4" :md="4" :lg="2" :xl="2" style="padding: 6px">
            <el-card :body-style="{ padding: '0px', textAlign: 'center' }" shadow="always" >
              <input :id="resource.uid" :checked="resourceUids.indexOf(resource.uid) >= 0" style="position: absolute; z-index: 100" type="checkbox" @click="checked(resource)" >
              <el-image :src="filePdf" style="cursor: pointer" fit="scale-down" />
              <div @click="showPicture(resource.pictureUrl)">
                <span v-if="resource.name" class="media-title">{{
                  resource.name
                }}</span>
                <span v-else class="media-title">{{ index + 1 }}</span>
              </div>
              <div style="margin-bottom: 14px">
                <el-button-group>
                  <el-tooltip class="item" effect="dark" content="复制图片地址" placement="bottom-start" style="margin-right: 2px" >
                    <el-button size="mini" icon="el-icon-copy-document" @click="copyUrl(resource.pictureUrl)" />
                  </el-tooltip>
                  <el-tooltip v-permission="'/picture/delete'" class="item" effect="dark" content="删除" placement="bottom-start" style="margin-right: 2px" >
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(resource)" />
                  </el-tooltip>
                </el-button-group>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!--分页-->
        <div class="block">
          <el-pagination
            :current-page.sync="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-upload
        ref="upload"
        :action="uploadResourcesHost"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :data="otherData"
        :on-success="fileSuccess"
        class="upload-demo"
        drag
        name="filedatas"
        multiple >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">不超过100MB</div>
      </el-upload>
    </el-dialog>

    <el-dialog
      :visible.sync="dialogPictureVisible"
      fullscreen
      style="text-align: center"
    >
      <img :src="dialogImageUrl" alt="" >
    </el-dialog>
  </div>
</template>

<script>
import { getResourceSortList } from '@/api/resourceSort'
import { getResources, addResource, deleteResource } from '@/api/resources'
import { getToken } from '@/utils/auth'
import filePdf from '@/assets/images/file/file_pdf.png'
import Vue from 'vue'

export default {
  components: {},
  data() {
    return {
      filePdf: filePdf,
      dialogImageUrl: '', // 图片显示地址
      checkedPicture: {}, // 单选的图片
      dialogPictureVisible: false,
      uploadResourcesHost: null,
      fileList: [],
      resourceSortUid: undefined, // 当前选中的图片分类uid
      resourceSort: {}, // 当前选中的图片分类
      resourceUids: [], // 图片uid集合
      resourcesUploadList: [], // 图片上传列表
      chooseTitle: '全选',
      isCheckedAll: false, // 是否全选
      fileUids: '', // 上传时候的文件uid
      form: {
        uid: null,
        fileUid: null,
        picName: null,
        resourceSortUid: null
      },
      tableData: [], // 显示的图片列表
      count: 0, // 计数器，用于记录上传次数
      loading: true,
      currentPage: 1,
      pageSize: 18,
      total: null,
      title: '上传文件',
      dialogFormVisible: false,
      keyword: '',
      reFresh: true, // 是否刷新组件
      activeName: '0',
      resourceSorts: [],
      havePictureSorts: false // 是否加载完图片分类
    }
  },
  watch: {
    checkedPicture(val) {
      this.reFresh = false
    }
  },
  created() {
    // 传递过来的pictureSordUid
    this.resourceSortUid = this.$route.query.pictureSortUid
    // 图片上传地址
    this.uploadResourcesHost = process.env.PICTURE_API + '/file/resources'
    // 其它数据
    this.otherData = {
      source: 'picture',
      userUid: 'uid00000000000000000000000000000000',
      adminUid: 'uid00000000000000000000000000000000',
      projectName: 'blog',
      sortName: 'admin',
      token: getToken()
    }
    this.initResourcesSortList()
  },
  methods: {
    initResourcesSortList: function() {
      // 先加载分类
      var that = this
      if (!this.havePictureSorts) {
        var params = {}
        // TODO 全部把分类加载出来，如果图片很多的话，不能这么做
        params.pageSize = 500
        params.currentPage = 1
        getResourceSortList(params).then(function(response) {
          if (response.code === that.$ECode.SUCCESS) {
            var resourceSorts = response.data.records
            console.log(resourceSorts)
            that.resourceSorts = resourceSorts
            if (resourceSorts.length > 0) {
              // 判断是否通过图片分类跳转的
              var resourceSortUid = that.resourceSortUid
              // 默认初始化第一个【给第一个tab添加初始化信息】
              if (resourceSortUid === undefined) {
                // 当没有被定义的时候，默认加载第一个
                that.resourceSortUid = resourceSorts[0].uid
                resourceSortUid = resourceSorts[0].uid
                // 设置默认选中的图片分类
                that.resourceSort = resourceSorts[0]
              } else {
                // 如果不为空，说明是通过图片分类跳转的，找出当前id所在的角标
                for (let i = 0; i < resourceSorts.length; i++) {
                  if (resourceSorts[i].uid === resourceSortUid) {
                    // 设置选中的分类和激活的index
                    that.activeName = '' + i
                    that.resourceSort = resourceSorts[i]
                  }
                }
              }
              that.clickTab(null)
            }
          } else {
            that.$message({ type: 'error', message: response.data })
          }
        })
      }
    },
    clickTab(e) {
      var that = this
      var index = this.activeName
      var resourceSortUid =
        this.resourceSorts[index].uid === undefined
          ? this.resourceSorts[index].resourceSortUid
          : this.resourceSorts[index].uid
      // 当前resourceSortUid
      this.resourceSortUid = resourceSortUid
      this.resourceSort = this.resourceSorts[index]
      var name = this.resourceSorts[index].sortName
      var params = {}
      params.currentPage = 1
      params.resourceSortUid = resourceSortUid
      params.pageSize = that.pageSize
      getResources(params).then(function(response) {
        if (response.code === that.$ECode.SUCCESS) {
          if (response.data.records.length > 0) {
            var newObject = {
              resourceSortUid: resourceSortUid,
              sortName: name,
              resources: response.data.records,
              pageSize: response.data.size,
              currentPage: response.data.current,
              total: response.data.total
            }
            that.pageSize = response.data.size
            that.currentPage = response.data.current
            that.total = response.data.total
            Vue.set(that.resourceSorts, index, newObject)
            that.tableData = response.data.records
          }
        } else {
          this.$commonUtil.message.error(response.message)
        }
      })
    },
    handleCurrentChange: function(val) {
      var that = this
      var resourceSort = this.resourceSort
      var params = {}
      params.resourceSort = this.resourceSortUid
      params.currentPage = val
      params.pageSize = that.pageSize
      getResources(params).then(function(response) {
        if (response.code === that.$ECode.SUCCESS) {
          var newObject = {
            resourceSortUid: resourceSort.uid,
            name: resourceSort.name,
            resources: response.data.records,
            pageSize: response.data.size,
            currentPage: response.data.current,
            total: response.data.total
          }
          that.pageSize = response.data.size
          that.currentPage = response.data.current
          that.total = response.data.total
          that.tableData = response.data.records
          Vue.set(that.resourceSorts, that.activeName, newObject)
        } else {
          this.$commonUtil.message.error(response.message)
        }
      })
    },
    showPicture: function(url) {
      this.dialogPictureVisible = true
      this.dialogImageUrl = url
    },
    copyUrl(url) {
      this.$commonUtil.copyText(url)
      this.$commonUtil.message.success('复制链接到剪切板成功')
    },
    // 点击单选
    checked: function(data) {
      const idIndex = this.resourceUids.indexOf(data.uid)
      if (idIndex >= 0) {
        // 选过了
        this.resourceUids.splice(idIndex, 1)
      } else {
        this.resourceUids.push(data.uid)
      }
      console.log('选择列表', this.pictureUids)
    },
    checkAll: function() {
      // // 如果是全选
      if (this.isCheckedAll) {
        this.resourceUids = []
        this.isCheckedAll = false
        this.chooseTitle = '全选'
      } else {
        this.resourceUids = []
        console.log('tableData', this.tableData)
        this.tableData.forEach(function(picture) {
          this.resourceUids.push(picture.uid)
        }, this)
        this.isCheckedAll = true
        this.chooseTitle = '取消全选'
      }
    },
    handleDelete: function(resource) {
      this.resourceUids = [resource.uid]
      this.handleDeleteBatch()
    },
    handleDeleteBatch: function() {
      if (this.resourceUids.length <= 0) {
        this.$commonUtil.message.error('请先选中文件！')
        return
      }
      this.$confirm('是否删除选中文件？, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = this.resourceUids.join(',') // 将数组变成,组成
          deleteResource(params).then(response => {
            if (response.code === this.$ECode.SUCCESS) {
              this.$commonUtil.message.success(response.message)
              // 清空选中的列表
              this.resourceUids = []
              this.checkedPicture = []
              this.handleCurrentChange(this.currentPage)
              this.chooseTitle = '全选'
              this.isCheckedAll = false
            }
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除')
        })
    },
    handleAdd: function() {
      this.dialogFormVisible = true
    },
    handlePreview: function() {},
    handleRemove: function() {},
    submitNormalUpload: function() {
      console.log()
      this.$refs.upload.submit()
    },
    fileSuccess: function(response, file, fileList) {
      if (response.code === this.$ECode.SUCCESS) {
        const file = response.data

        for (let index = 0; index < file.length; index++) {
          const resources = {}
          resources.fileUid = file[index].uid
          resources.resourceSortUid = this.resourceSortUid
          resources.name = file[index].picName
          this.resourcesUploadList.push(resources)
        }
        console.log(this.resourcesUploadList)
        this.count = this.count + 1
        if (this.count % fileList.length === 0) {
          addResource(this.resourcesUploadList).then(res => {
            if (res.code === this.$ECode.SUCCESS) {
              this.$commonUtil.message.success(res.message)
              this.handleCurrentChange(this.currentPage)
            } else {
              this.$commonUtil.message.error(res.message)
            }
            this.$refs.upload.clearFiles()
            this.fileUids = ''
            this.pictureUploadList = []
          })
        }
      } else {
        this.$commonUtil.message.error(response.message)
      }
    }
  }
}
</script>

<style scoped>
.media-title {
  color: #8492a6;
  font-size: 14px;
  padding: 3px;
  display: inline-block;
  white-space: nowrap;
  width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upload-demo {
  margin-top: 50px;
  width:  84px;
}
.block {
  position: absolute;
  /*   1.left 走50% 父容器宽度的一半 */
  left: 50%;
  /*  2、margin 负值  往左边走 自己盒子宽度的一半 */
  margin-left: -100px;
  /*   以上是水平居中 */
  bottom: 25px;
  width: 200px;
  height: 45px;
}
.el-image {
  width: 100%;
  height: 160px;
}
</style>
