<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <el-tabs v-permission="'/system/getMe'" v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="关于我" name="one">
        <span slot="label"><i class="el-icon-star-on"/> 关于我</span>
        <el-form ref="changeAdminForm" :model="form" style="margin-left: 20px;" label-position="left" label-width="100px">
          <el-form-item label="用户头像">
            <div v-if="form.photoList" class="imgBody">
              <i v-show="icon" class="el-icon-error inputClass" @click="deletePhoto()" @mouseover="icon = true"/>
              <img :src="form.photoList[0]" @mouseover="icon = true" @mouseout="icon = false" >
            </div>

            <div v-else class="uploadImgBody" @click="checkPhoto">
              <i class="el-icon-plus avatar-uploader-icon"/>
            </div>
          </el-form-item>

          <el-form-item label="昵称">
            <el-input v-model="form.nickName" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="性别">
            <el-radio v-for="gender in genderDictList" :key="gender.uid" v-model="form.gender" :label="gender.dictValue" border size="medium">{{ gender.dictLabel }}</el-radio>
          </el-form-item>

          <!-- <el-form-item label="手机号">
            <el-input v-model="form.mobile" style="width: 400px"></el-input>
          </el-form-item> -->

          <el-form-item label="邮箱">
            <el-input v-model="form.email" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="QQ号">
            <el-input v-model="form.qqNumber" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="Github">
            <el-input v-model="form.github" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="Gitee">
            <el-input v-model="form.gitee" style="width: 400px"/>
          </el-form-item>

          <!-- <el-form-item label="微信号">
            <el-input v-model="form.weChat" style="width: 400px"></el-input>
          </el-form-item> -->

          <el-form-item label="职业">
            <el-input v-model="form.occupation" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="简介">
            <el-input
              :autosize="{ minRows: 3, maxRows: 10}"
              v-model="form.summary"
              type="textarea"
              placeholder="请输入内容"
              style="width: 400px"/>
          </el-form-item>

          <el-form-item>
            <el-button v-permission="'/system/editMe'" type="primary" @click="submitForm('changeAdminForm')">保 存</el-button>
            <!-- <el-button @click="cancel('changeAdminForm')">重 置</el-button>             -->
          </el-form-item>

        </el-form>
      </el-tab-pane>

      <!-- <el-tab-pane label="显示配置" name="second">
      <span slot="label"><i class="el-icon-setting"></i> 显示配置</span>
        <el-form style="margin-left: 20px;" label-position="left" :model="form" label-width="100px">

        <el-tag style="font-size: 15px; margin:10px 0 10px 0;" type="warning" >这里主要是控制web前端，关于我页面中，一些个人信息的显示</el-tag>

        <el-form-item label="手机">
          <el-switch v-model="form.delivery"></el-switch>
        </el-form-item>

        <el-form-item label="微信">
          <el-switch v-model="form.delivery"></el-switch>
        </el-form-item>

        <el-form-item label="QQ号">
          <el-switch v-model="form.delivery"></el-switch>
        </el-form-item>

        <el-form-item label="职业">
          <el-switch v-model="form.delivery"></el-switch>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">重 置</el-button>
        </el-form-item>

        </el-form>

      </el-tab-pane> -->

      <el-tab-pane label="个人履历" name="third">
        <span slot="label"><i class="el-icon-edit"/> 个人履历</span>
        <div class="editor-container">
          <CKEditor ref="editor" :content="form.personResume" :height="500"/>
        </div>
        <div style="margin-top: 5px; margin-left: 10px;" >
          <el-button v-permission="'/system/editMe'" type="primary" @click="submitForm('personResume')">保 存</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="four">
        <span slot="label"><i class="el-icon-edit"/> 修改密码</span>
        <el-form ref="changePwdForm" :rules="rules" :model="changePwdForm" style="margin-left: 20px;" label-position="left" label-width="80px">
          <el-form-item label="旧密码" prop="oldPwd">
            <el-input v-model="changePwdForm.oldPwd" type="password" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="新密码" prop="newPwd1">
            <el-input v-model="changePwdForm.newPwd1" type="password" style="width: 400px"/>
          </el-form-item>

          <el-form-item label="重复输入" prop="newPwd2">
            <el-input v-model="changePwdForm.newPwd2" type="password" style="width: 400px"/>
          </el-form-item>

          <el-form-item>
            <el-button v-permission="'/system/changePwd'" type="primary" @click="submitForm('changePwdForm')">保 存</el-button>
            <el-button v-permission="'/system/changePwd'" @click="cancel('changePwdForm')">重 置</el-button>
          </el-form-item>

        </el-form>
      </el-tab-pane>

    </el-tabs>

    <avatar-cropper
      v-show="imagecropperShow"
      :key="imagecropperKey"
      :width="300"
      :height="300"
      :url="url"
      lang-type="zh"
      @close="close"
      @crop-upload-success="cropSuccess"
    />

  </div>
</template>

<script>
import AvatarCropper from '@/components/AvatarCropper'
import { getMe, editMe, changePwd } from '@/api/system'
import CKEditor from '@/components/CKEditor'
import MarkdownEditor from '@/components/MarkdownEditor'
import { getSystemConfig } from '@/api/systemConfig'
import { getListByDictType } from '@/api/sysDictData'

export default {
  components: {
    AvatarCropper,
    CKEditor,
    MarkdownEditor
  },
  data() {
    return {
      genderDictList: [], // 字典列表
      activeName: 'one',
      imagecropperShow: false,
      imagecropperKey: 0,
      url: process.env.PICTURE_API + '/file/cropperPicture',
      form: {},
      systemConfig: {},
      changePwdForm: {
        oldPwd: '',
        newPwd1: '',
        newPwd2: ''
      },
      photoVisible: false, // 控制图片选择器的显示
      photoList: [],
      fileIds: '',
      icon: false, // 控制删除图标的显示
      // 定义规则
      rules: {
        oldPwd: [
          { required: true, message: '请输入原来密码', trigger: 'blur' }
        ],
        newPwd1: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 5, message: '密码长度需要大于等于 5 个字符', trigger: 'blur' }
        ],
        newPwd2: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { min: 5, message: '密码长度需要大于等于 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    language() {
      return this.languageTypeList['zh']
    }
  },
  created() {
    this.getSystemConfigList()
    this.getDictList()
    this.getMeInfo()
  },
  methods: {
    getMeInfo: function() {
      var getMeParams = new URLSearchParams()
      getMe(getMeParams).then(response => {
        if (response.code == this.$ECode.SUCCESS) {
          this.form = response.data
          this.fileIds = this.form.avatar
        }
      })
    },
    handleClick(tab, event) {
      // 设置富文本内容
      if (this.form.personResume) {
        this.$refs.editor.setData(this.form.personResume)
      }
    },
    // 获取系统配置
    getSystemConfigList: function() {
      getSystemConfig().then(response => {
        if (response.code == this.$ECode.SUCCESS) {
          this.systemConfig = response.data
        }
      })
    },
    /**
     * 字典查询
     */
    getDictList: function() {
      var params = {}
      params.dictType = 'sys_user_sex'
      getListByDictType(params).then(response => {
        if (response.code == this.$ECode.SUCCESS) {
          this.genderDictList = response.data.list
        }
      })
    },
    cropSuccess(resData) {
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
      const photoList = []
      photoList.push(resData[0].url)
      this.form.photoList = photoList
      this.form.avatar = resData[0].uid
    },
    close() {
      this.imagecropperShow = false
    },
    deletePhoto: function() {
      this.form.photoList = null
      this.form.fileUid = ''
      this.icon = false
    },
    // 弹出选择图片框
    checkPhoto() {
      this.imagecropperShow = true
    },
    submitForm: function(type) {
      switch (type) {
        // 1、改变用户信息
        case 'changeAdminForm':
          {
            editMe(this.form).then(response => {
              console.log(response)
              this.$notify({
                title: '成功',
                message: response.message,
                type: 'success'
              })
            })
          }
          break

        // 2、改变个人履历
        case 'personResume':
          {
          // 获取CKEditor中的内容
            this.form.personResume = this.$refs.editor.getData()
            editMe(this.form).then(response => {
              console.log(response)
              this.$notify({
                title: '成功',
                message: response.message,
                type: 'success'
              })
            })
          }
          break

        // 3、改变密码
        case 'changePwdForm':
          {
            this.$refs[type].validate(valid => {
              if (valid) {
                if (this.changePwdForm.newPwd1 != this.changePwdForm.newPwd2) {
                  this.$notify.error({
                    title: '警告',
                    message: '两次输入密码不一致'
                  })
                  return false
                }
                if (this.changePwdForm.oldPwd == this.changePwdForm.newPwd2) {
                  this.$notify.error({
                    title: '警告',
                    message: '新密码不能和旧密码一致'
                  })
                  return false
                }
                var params = new URLSearchParams()
                params.append('oldPwd', this.changePwdForm.oldPwd)
                params.append('newPwd', this.changePwdForm.newPwd1)
                changePwd(params).then(response => {
                  console.log(response)
                  if (response.code == this.$ECode.SUCCESS) {
                    this.$notify({
                      title: '成功',
                      message: response.message,
                      type: 'success'
                    })
                    this.cancel(type)
                  } else {
                    this.$notify.error({
                      title: '警告',
                      message: response.message
                    })
                  }
                })
              } else {
                console.log('error submit!!')
                return false
              }
            })
          }
          break
      }
    },
    cancel: function(type) {
      this.$refs[type].resetFields()
    }
  }
}
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  margin: 0, 0, 0, 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.imgBody {
  width: 100px;
  height: 100px;
  border: solid 2px #ffffff;
  float: left;
  position: relative;
}
.uploadImgBody {
  margin-left: 5px;
  width: 100px;
  height: 100px;
  border: dashed 1px #c0c0c0;
  float: left;
  position: relative;
}
.uploadImgBody :hover {
  border: dashed 1px #00ccff;
}
.inputClass {
  position: absolute;
}
.img {
  width: 100%;
  height: 100%;
}
img {
  width: 100px;
  height: 100px;
}

.editor-container{
  margin-top: 10px;
  margin-bottom: 30px;
}
</style>
