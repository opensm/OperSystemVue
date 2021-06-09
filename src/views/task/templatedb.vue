<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">添加</el-button>

    <el-table :data="templateDbList" style="width: 100%;margin-top:30px;" border>
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
          {{ scope.row.instance }}
        </template>
      </el-table-column>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新增角色'">
      <el-form :model="templateDb" label-width="80px" label-position="left">
        <el-form-item label="相关服务">
          <el-input v-model="templateDb.name" placeholder="相关服务" />
        </el-form-item>
        <el-form-item label="操作类">
          <el-input v-model="templateDb.exec_class" placeholder="填入操作类" />
        </el-form-item>
        <el-form-item label="操作方法">
          <el-input v-model="templateDb.exec_function" placeholder="填入操作方法" />
        </el-form-item>
        <el-form-item label="项目">
          <el-select
            v-model="templateDb.instance"
            filterable
            default-first-option
            placeholder="请选择项目"
          >
            <el-option
              v-for="item in instanceList"
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
import { getTemplateDBs, updateTemplateDB, addTemplateDB, deleteTemplateDB } from '@/api/templatedb'
import { getAuthKEYs } from '@/api/auth_key'
import { current_user } from '@/api/user'

const defaultTemplate = {
  id: '',
  name: '',
  instance: '',
  exec_class: '',
  exec_function: '',
  create_user: ''
}
export default {
  data() {
    return {
      templateDb: Object.assign({}, defaultTemplate),
      templateDbList: [],
      instanceList: [],
      project: [],
      user: {},
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getTemplateDB()
    this.getInstance()
    this.getUsers()
  },
  methods: {
    getTemplateDB() {
      getTemplateDBs().then(response => {
        const { data } = response
        this.templateDbList = data
      })
    },
    getInstance() {
      getAuthKEYs().then(response => {
        const { data } = response
        this.instanceList = data
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
      this.templateDb = Object.assign({}, defaultTemplate)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.templateDb = deepClone(scope.row)
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
          await deleteTemplateDB(row.id)
          this.templateDbList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      this.templateDb.create_user = this.user
      if (isEdit) {
        await updateTemplateDB(this.templateDb.id, this.templateDb)
      } else {
        const { data } = await addTemplateDB(this.templateDb)
        this.templateDb.id = data.id
        this.templateDbList.push(this.templateDb)
      }
      const { desc, id, name } = this.templateDb
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
