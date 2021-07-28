<template>
  <div class="app-container">
    <el-button
      type="primary"
      :disabled="post === false"
      @click="handleAddProject"
    >添加</el-button>

    <el-table :data="projectList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="项目">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建时间">
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑项目':'新增项目'" :close-on-click-modal="false">
      <el-form :model="project" label-width="80px" label-position="left">
        <el-form-item label="项目ID">
          <el-input v-model="project.id" placeholder="项目ID" :disabled="dialogType ==='edit'" />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input
            v-model="project.name"
            placeholder="项目名称"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmProject">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getProjects, updateProject, addProject, deleteProject } from '@/api/project'

const defaultProject = {
  id: '',
  name: ''
}
export default {
  data() {
    return {
      data: {},
      project: {
        id: '',
        name: ''
      },
      post: true,
      projectList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and Projects list from server
    this.getProjects()
  },
  methods: {
    getProjects() {
      getProjects().then(response => {
        const { data } = response
        this.projectList = data
        this.post = response.meta.post_tag
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddProject() {
      this.project = Object.assign({}, defaultProject)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.project = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认删除该项目吗?!', '提示！', {
        confirmButtonText: '确认',
        cancelButtonText: '删除',
        type: 'warning'
      })
        .then(() => {
          deleteProject(row.id).then(response => {
            const { data } = response
            this.getProjects()
            this.$notify({
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: `
            <div>项目ID: ${data.id}</div>
            <div>项目名称: ${data.name}</div>
`,
              type: 'success'
            })
          })
        })
        .catch(err => { console.error(err) })
    },
    async confirmProject() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateProject(this.project.id, this.project)
      } else {
        const { data } = await addProject(this.project)
        this.project.id = data.id
        this.projectList.push(this.project)
      }
      this.getProjects()
      const { id, name } = this.project
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>项目ID: ${id}</div>
            <div>项目名称: ${name}</div>
`,
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .Projects-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
