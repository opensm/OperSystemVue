<template>
  <div class="app-container">
    <el-button type="primary" :disabled="post === false" @click="handleAddRole">添加</el-button>

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
          {{ scope.row.instance_st }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="调用类">
        <template slot-scope="scope">
          {{ scope.row.exec_class }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="调用方法">
        <template slot-scope="scope">
          {{ scope.row.exec_function }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="所属项目">
        <template slot-scope="scope">
          {{ scope.row.project_st }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作用户">
        <template slot-scope="scope">
          {{ scope.row.create_user_st }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作时间">
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑模板':'新增模板'" :close-on-click-modal="false">
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
        <el-form-item label="所属项目">
          <el-select
            v-model="templateDb.project"
            filterable
            default-first-option
            placeholder="请选择所属项目"
          >
            <el-option
              v-for="item in project"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据库实例">
          <el-select
            v-model="templateDb.instance"
            filterable
            default-first-option
            placeholder="请选择数据库实例"
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
import { getProjects } from '@/api/project'

const defaultTemplate = {
  id: '',
  name: '',
  instance: '',
  exec_class: '',
  exec_function: '',
  create_user: '',
  project: ''
}
export default {
  data() {
    return {
      templateDb: Object.assign({}, defaultTemplate),
      templateDbList: [],
      instanceList: [],
      project: [],
      post: false,
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getTemplateDB()
  },
  methods: {
    getProjects() {
      getProjects().then(response => {
        const { data } = response
        this.project = data
      })
    },
    getTemplateDB() {
      getTemplateDBs().then(response => {
        const { data, meta } = response
        this.templateDbList = data
        this.post = meta.post_tag
      })
    },
    getInstance() {
      getAuthKEYs().then(response => {
        const { data } = response
        this.instanceList = data
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddRole() {
      this.templateDb = Object.assign({}, defaultTemplate)
      this.getInstance()
      this.getProjects()
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.getInstance()
      this.getProjects()
      this.dialogVisible = true
      this.checkStrictly = true
      this.templateDb = deepClone(scope.row)
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认删除?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          deleteTemplateDB(row.id).then(response => {
            const { meta } = response
            this.templateDbList.splice($index, 1)
            this.dialogVisible = false
            const { id, name } = this.templateDb
            this.$notify({
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: `<div>ID: ${id}</div><div>名称: ${name}</div><div>返回信息: ${meta.msg}</div>`,
              type: 'success'
            })
            this.dialogVisible = false
            this.getTemplateDB()
          })
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        updateTemplateDB(this.templateDb.id, this.templateDb).then(response => {
          const { data, meta } = response
          this.templateDb.id = data.id
          // this.authKeyList.update(this.authKey)
          const { id, name } = this.templateDb
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
          this.getTemplateDB()
        })
      } else {
        addTemplateDB(this.templateDb).then(response => {
          const { data, meta } = response
          this.templateDb.id = data.id
          this.templateDbList.push(this.templateDb)
          const { id, name } = this.templateDb
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
          this.getTemplateDB()
        })
      }
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
