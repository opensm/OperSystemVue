<template>
  <div class="app-container">
    <el-button type="primary" :disabled=" post === false " @click="handleAddKey">添加</el-button>

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
      <el-table-column align="center" label="验证地址">
        <template slot-scope="scope">
          {{ scope.row.auth_host }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="验证端口">
        <template slot-scope="scope">
          {{ scope.row.auth_port }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="验证用户">
        <template slot-scope="scope">
          {{ scope.row.auth_user }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="验证参数">
        <template slot-scope="scope">
          {{ scope.row.auth_params }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建用户">
        <template slot-scope="scope">
          {{ scope.row.create_user_st }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="所属项目">
        <template slot-scope="scope">
          {{ scope.row.project_st }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建日期">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled=" ! buttonStatus(scope.row.button,'PUT')" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="small" :disabled=" ! buttonStatus(scope.row.button,'DELETE')" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑密钥':'新增密钥'" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :model="authKey"
        :rules="rules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="验证名称" prop="name">
          <el-input v-model="authKey.name" placeholder="验证名称" />
        </el-form-item>
        <el-form-item label="验证地址" prop="auth_host">
          <el-input v-model="authKey.auth_host" placeholder="输入验证地址" />
        </el-form-item>
        <el-form-item label="认证端口" prop="auth_port">
          <el-input v-model="authKey.auth_port" placeholder="输入认证端口" />
        </el-form-item>
        <el-form-item label="认证用户" prop="auth_user">
          <el-input v-model="authKey.auth_user" placeholder="输入认证用户" />
        </el-form-item>
        <el-form-item label="验证密钥" prop="auth_passwd">
          <el-input v-model="authKey.auth_passwd" type="password" placeholder="输入验证密钥" />
        </el-form-item>
        <el-form-item label="验证参数" prop="auth_params">
          <el-input v-model="authKey.auth_params" placeholder="输入验证参数" />
        </el-form-item>
        <el-form-item label="认证类型" prop="auth_type">
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
        <el-form-item label="项目" prop="project">
          <el-select
            v-model="authKey.project"
            filterable
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
  filters: {
    dataList(data, dataLists) {
      const map = {}
      dataLists.map((item) => {
        map[item.id] = item.name
      })
      return map[data]
    }
  },
  data() {
    return {
      authKey: Object.assign({}, defaultKey),
      authKeyList: [],
      post: false,
      authType: ['MySQL', 'Mongo', 'Kubernetes', 'Nacos', 'Qcloud'],
      project: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      rules: {
        name: [{
          required: true, message: '名称必须填写!', trigger: 'blur'
        }],
        auth_host: [{
          required: true, message: '验证地址必须填写！', trigger: 'blur'
        }],
        auth_port: [{
          required: true, message: '端口必须填写！', trigger: 'blur'
        }],
        auth_passwd: [{
          required: true, message: '密钥必须填写必须填写！', trigger: 'blur'
        }],
        auth_type: [{
          required: true, message: '验证类型必须选择！', trigger: 'blur'
        }],
        project: [{
          required: true, message: '所属项目必须选择！', trigger: 'blur'
        }]
      }
    }
  },
  created() {
    // Mock: get all routes and Keys list from server
    this.getKeys()
  },
  methods: {
    buttonStatus(data, button) {
      if (data === undefined || data.length <= 0) {
        return false
      } else {
        return data.includes(button)
      }
    },
    getKeys() {
      getAuthKEYs().then(response => {
        const { data, meta } = response
        this.authKeyList = data
        this.post = meta.post_tag
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
      this.getProjects()
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.getProjects()
      this.authKey = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认都删除该密钥?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteAuthKey(row.id).then(response => {
            const { meta } = response
            this.authKeyList.splice($index, 1)
            const { id, name } = this.authKey
            this.$notify({
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: `
            <div>ID: ${id}</div>
            <div>校验名称: ${name}</div>
            <div>返回信息: ${meta.msg}</div>`,
              type: 'success'
            })
            this.dialogVisible = false
            this.getKeys()
          })
        })
        .catch(err => { console.error(err) })
    },
    confirmKey() {
      const isEdit = this.dialogType === 'edit'
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (isEdit) {
            updateAuthKey(this.authKey.id, this.authKey).then(response => {
              const { data, meta } = response
              this.authKey.id = data.id
              const { id, name } = this.authKey
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>ID: ${id}</div>
            <div>校验名称: ${name}</div>
            <div>返回信息: ${meta.msg}</div>`,
                type: 'success'
              })
              this.dialogVisible = false
              this.getKeys()
            })
          } else {
            addAuthKey(this.authKey).then(response => {
              const { data, meta } = response
              this.authKey.id = data.id
              this.authKey.create_time = data.create_time
              this.authKeyList.push(this.authKey)
              const { id, name } = this.authKey
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>ID: ${id}</div>
            <div>校验名称: ${name}</div>
            <div>返回信息: ${meta.msg}</div>`,
                type: 'success'
              })
            })
            this.dialogVisible = false
            this.getKeys()
          }
        }
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
