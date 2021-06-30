<template>
  <div class="app-container">
    <el-form :model="temp" label-width="100px" label-position="right">
      <el-form-item label="旧密码">
        <el-input v-model="temp.oldPassword" placeholder="输入旧密码" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="temp.password" placeholder="输入新密码" type="password" style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="确认新密码">
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
    return {
      user: '',
      checkStrictly: false,
      temp: {
        'oldPassword': '',
        'password': '',
        'confirmPassword': ''
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
        this.user = data.id
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    confirmRole() {
      console.log(this.temp)
      resetPassword(this.temp).then(response => {
        const { data, meta } = response
        this.$notify({
          title: '成功',
          dangerouslyUseHTMLString: true,
          message: `
            <div>角色ID: ${this.user}</div>
            <div>角色名称: ${data}</div>`,
          type: 'success'
        })
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
