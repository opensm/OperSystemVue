<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">添加</el-button>

    <el-table :data="templateNacosList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="模板名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="相关实例">
        <template slot-scope="scope">
          {{ scope.row.auth_key }}
        </template>
      </el-table-column>s
      <el-table-column align="header-center" label="调用类">
        <template slot-scope="scope">
          {{ scope.row.exec_class }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="调用方法">
        <template slot-scope="scope">
          {{ scope.row.exec_function }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="操作用户">
        <template slot-scope="scope">
          {{ scope.row.create_user }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="操作时间">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled=" ! scope.row.button.includes('PUT')" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="small" :disabled=" ! scope.row.button.includes('DELETE')" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑模板':'新增模板'">
      <el-form :model="templateNacos" label-width="100px" label-position="left">
        <el-form-item label="模板名称">
          <el-input v-model="templateNacos.name" placeholder="填入模板名称" />
        </el-form-item>
        <el-form-item label="操作类">
          <el-input v-model="templateNacos.exec_class" placeholder="填入操作类" />
        </el-form-item>
        <el-form-item label="操作方法">
          <el-input v-model="templateNacos.exec_function" placeholder="填入操作方法" />
        </el-form-item>
        <el-form-item label="验证密钥">
          <el-select
            v-model="templateNacos.auth_key"
            filterable
            default-first-option
            placeholder="请选择验证密钥"
          >
            <el-option
              v-for="item in authKeyList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getTemplateNacoses, updateTemplateNacos, addTemplateNacos, deleteTemplateNacos } from '@/api/templatenacos'
import { getAuthKEYs } from '@/api/auth_key'
import { current_user } from '@/api/user'

const defaultTemplate = {
  id: '',
  name: '',
  auth_key: '',
  exec_class: '',
  exec_function: '',
  create_user: ''
}
export default {
  data() {
    return {
      templateNacos: Object.assign({}, defaultTemplate),
      templateNacosList: [],
      authKeyList: [],
      project: [],
      user: {},
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.gettemplateNacos()
    this.getAuthKey()
    this.getUsers()
  },
  methods: {
    gettemplateNacos() {
      getTemplateNacoses().then(response => {
        const { data } = response
        this.templateNacosList = data
      })
    },
    getAuthKey() {
      getAuthKEYs().then(response => {
        const { data } = response
        this.authKeyList = data
      })
    },
    getUsers() {
      current_user().then(response => {
        const { data } = response
        this.user = data.id
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddRole() {
      this.templateNacos = Object.assign({}, defaultTemplate)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.templateNacos = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('Confirm to remove the role?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteTemplateNacos(row.id)
          this.templateNacosList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      this.templateNacos.create_user = this.user
      if (isEdit) {
        await updateTemplateNacos(this.templateNacos.id, this.templateNacos)
      } else {
        const { data } = await addTemplateNacos(this.templateNacos)
        this.templateNacos.id = data.id
        this.templateNacosList.push(this.templateNacos)
      }
      const { desc, id, name } = this.templateNacos
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色ID: ${id}</div>
            <div>角色名称: ${name}</div>
            <div>描述: ${desc}</div>
`,
        type: 'success'
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
