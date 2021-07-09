<template>
  <div class="app-container">
    <el-form ref="dataForm" :model="temp" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="temp.oldPassword" placeholder="输入旧密码" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="temp.password" placeholder="输入新密码" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="temp.confirmPassword" placeholder="输入确认新密码" type="password" style="width: 200px;"/>
      </el-form-item>
    </el-form>
    <div style="text-align:right;">
      <el-button type="danger" @click="dialogVisible=false">取消</el-button>
      <el-button type="primary" @click="confirmRole">确认</el-button>
    </div>
  </div>
</template>

<script>
import { current_user, resetPassword } from '@/api/user'
// import { constantRoutes } from "@/router";
export default {
  data() {
    // 此处即表单发送之前验证  验证新密码与原密码
    const validateNewPassword = (rule, value, callback) => {
      if (value === this.temp.oldPassword) {
        return callback(new Error('新密码不能与原密码相同!'))
      } else {
        callback()
      }
    }
    // 此处即表单发送之前验证  验证新密码与再次确认
    const validateNewPassword2 = (rule, value, callback) => {
      if (value !== this.temp.password) {
        callback(new Error('与新密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      user: '',
      checkStrictly: false,
      temp: {
        'oldPassword': '',
        'password': '',
        'confirmPassword': ''
      },
      rules: {
        // 验证规则
        oldPassword: [{
          required: true,
          message: '请输入原密码',
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: '请设置新密码',
          trigger: 'blur'
        }, {
          validator: validateNewPassword,
          trigger: 'blur'
        }],
        confirmPassword: [{
          required: true,
          message: '请确认新密码',
          trigger: 'blur'
        }, {
          validator: validateNewPassword2,
          trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getCurrentUser()
  },
  methods: {
    getCurrentUser() {
      current_user().then(response => {
        const { data } = response
        this.user = data.name
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    confirmRole() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          resetPassword(this.temp).then(response => {
            const { meta } = response
            this.$notify({
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: `
            <div>姓名: ${this.user}</div>
            <div>提示: ${meta.msg}</div>`,
              type: 'success'
            })
            if (meta.code === '00000') {
              this.$router.push({ path: '/auth/reset_passwd' })
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
