<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddKey">添加</el-button>

    <el-table :data="authKeyList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="验证类型">
        <template slot-scope="scope">
          {{ scope.row.auth_type }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="验证地址">
        <template slot-scope="scope">
          {{ scope.row.auth_host }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="验证端口">
        <template slot-scope="scope">
          {{ scope.row.auth_port }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="验证用户">
        <template slot-scope="scope">
          {{ scope.row.auth_user }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="验证参数">
        <template slot-scope="scope">
          {{ scope.row.auth_params }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="所属项目">
        <template slot-scope="scope">
          {{ scope.row.project }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建日期">
        <template slot-scope="scope">
          {{ scope.row.create_user }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled=" ! scope.row.button.includes('PUT')" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="small" :disabled=" ! scope.row.button.includes('DELETE')" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑密钥':'新增密钥'">
      <el-form :model="authKey" label-width="80px" label-position="left">
        <el-form-item label="验证名称">
          <el-input v-model="authKey.name" placeholder="验证名称" />
        </el-form-item>
        <el-form-item label="验证地址">
          <el-input v-model="authKey.auth_host" placeholder="输入验证地址" />
        </el-form-item>
        <el-form-item label="认证端口">
          <el-input v-model="authKey.auth_port" placeholder="输入认证端口" />
        </el-form-item>
        <el-form-item label="认证用户">
          <el-input v-model="authKey.auth_user" placeholder="输入认证用户" />
        </el-form-item>
        <el-form-item label="验证密钥">
          <el-input v-model="authKey.auth_passwd" type="password" placeholder="输入验证密钥" />
        </el-form-item>
        <el-form-item label="验证参数">
          <el-input v-model="authKey.auth_params" placeholder="输入验证参数" />
        </el-form-item>
        <el-form-item label="认证类型">
          <el-select
            v-model="authKey.auth_type"
            filterable
            allow-create
            default-first-option
            placeholder="请选择认证类型"
          >
            <el-option
              v-for="item in authType"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目">
          <el-select
            v-model="authKey.project"
            filterable
            allow-create
            default-first-option
            placeholder="请选择项目"
          >
            <el-option
              v-for="item in project"
              :key="item.id"
              :label="item.id + ':' +item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmKey">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getAuthKEYs, updateAuthKey, addAuthKey, deleteAuthKey } from '@/api/auth_key'
import { getProjects } from '@/api/project'
import { current_user } from '@/api/user'

const defaultKey = {
  id: '',
  name: '',
  auth_host: '',
  auth_port: '',
  auth_user: '',
  auth_passwd: '',
  auth_params: '',
  auth_type: '',
  project: '',
  create_user: ''
}
export default {
  data() {
    return {
      authKey: Object.assign({}, defaultKey),
      authKeyList: [],
      authType: ['MySQL', 'Mongo', 'Kubernetes', 'Nacos', 'Qcloud'],
      user: {},
      project: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and Keys list from server
    this.getKeys()
    this.getProjects()
    this.getCurrentUser()
  },
  methods: {
    getKeys() {
      getAuthKEYs().then(response => {
        const { data } = response
        this.authKeyList = data
      })
    },
    getCurrentUser() {
      current_user().then(response => {
        const { data } = response
        this.user = data.id
      })
    },
    getProjects() {
      getProjects().then(response => {
        const { data } = response
        this.project = data
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddKey() {
      this.authKey = Object.assign({}, defaultKey)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.authKey = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认都删除该密钥?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteAuthKey(row.id)
          this.authKey.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    async confirmKey() {
      const isEdit = this.dialogType === 'edit'
      this.authKey.create_user = this.user
      console.log(this.authKey)
      if (isEdit) {
        await updateAuthKey(this.authKey.id, this.authKey)
      } else {
        const { data } = await addAuthKey(this.authKey)
        this.authKey.id = data.id
        this.authKeyList.push(this.authKey)
      }
      const { id, name } = this.authKey
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>ID: ${id}</div>
            <div>校验名称: ${name}</div>`,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .Keys-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
