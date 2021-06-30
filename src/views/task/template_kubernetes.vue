<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddData">添加</el-button>

    <el-table :data="kubernetesTemplateList" style="width: 100%;margin-top:30px;" border>
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
      <el-table-column align="header-center" label="关联密钥">
        <template slot-scope="scope">
          {{ scope.row.instance_st }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="命名空间">
        <template slot-scope="scope">
          {{ scope.row.namespace }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="应用名称">
        <template slot-scope="scope">
          {{ scope.row.app_name }}
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
      <el-table-column align="header-center" label="操作方式">
        <template slot-scope="scope">
          {{ scope.row.control_type }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="yaml模板">
        <template slot-scope="scope">
          {{ scope.row.yaml }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="标签">
        <template slot-scope="scope">
          {{ scope.row.label }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="所属项目">
        <template slot-scope="scope">
          {{ scope.row.project_st }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建用户">
        <template slot-scope="scope">
          {{ scope.row.create_user_st }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.create_time }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            :disabled=" ! scope.row.button.includes('PUT')"
            @click="handleEdit(scope)"
          >
            修改
          </el-button>
          <el-button
            type="danger"
            size="small"
            :disabled=" ! scope.row.button.includes('DELETE')"
            @click="handleDelete(scope)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑模板':'新增模板'" :close-on-click-modal="false">
      <el-form :model="kubernetesTemplate" label-width="100px" label-position="left">
        <el-form-item label="模板名称">
          <el-input
            v-model="kubernetesTemplate.name"
            placeholder="模板名称"
          />
        </el-form-item>
        <el-form-item label="所属项目">
          <el-select
            v-model="kubernetesTemplate.project"
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
        <el-form-item label="Kubernetes模板">
          <el-select
            v-model="kubernetesTemplate.cluster"
            filterable
            default-first-option
            placeholder="请选择Kubernetes模板"
          >
            <el-option
              v-for="item in clusters"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="命名空间">
          <el-input
            v-model="kubernetesTemplate.namespace"
            placeholder="请填入命名空间"
          />
        </el-form-item>
        <el-form-item label="应用名称">
          <el-input
            v-model="kubernetesTemplate.app_name"
            placeholder="请填入应用名称"
          />
        </el-form-item>
        <el-form-item label="调用类">
          <el-input
            v-model="kubernetesTemplate.exec_class"
            placeholder="请填入调用类"
          />
        </el-form-item>
        <el-form-item label="调用方法">
          <el-input
            v-model="kubernetesTemplate.exec_function"
            placeholder="请填入调用方法"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="kubernetesTemplate.label"
            placeholder="请填入标签"
          />
        </el-form-item>
        <el-form-item label="操作方式">
          <el-select
            v-model="kubernetesTemplate.control_type"
            filterable
            default-first-option
            placeholder="请选择操作方式"
          >
            <el-option
              v-for="( item,key ) in control_type"
              :key="key"
              :label="key + ':' + item"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="yaml模板">
          <el-input
            v-model="kubernetesTemplate.yaml"
            placeholder="请填入yaml模板"
          />
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
import { getTemplateKubernetes, updateTemplateKubernete, addTemplateKubernete, deleteTemplateKubernete } from '@/api/templatekubernetes'
import { getAuthKEYs } from '@/api/auth_key'
import { getProjects } from '@/api/project'

const defaultTemplate = {
  id: '',
  name: '',
  cluster: '',
  namespace: '',
  app_name: '',
  control_type: '',
  yaml: '',
  exec_class: '',
  label: '',
  exec_function: '',
  create_user: '',
  project: ''
}
export default {
  data() {
    return {
      kubernetesTemplate: Object.assign({}, defaultTemplate),
      kubernetesTemplateList: [],
      control_type: { 'create': '创建', 'update': '更新', 'delete': '删除' },
      clusters: [],
      project: [],
      user: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getTemplates()
    this.getClusters()
    this.getProjects()
  },
  methods: {
    getProjects() {
      getProjects().then(response => {
        const { data } = response
        this.project = data
      })
    },
    getTemplates() {
      getTemplateKubernetes().then(response => {
        const { data } = response
        this.kubernetesTemplateList = data
      })
    },
    getClusters() {
      getAuthKEYs({ 'auth_type': 'Kubernetes' }).then(response => {
        const { data } = response
        this.clusters = data
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddData() {
      this.kubernetesTemplate = Object.assign({}, this.kubernetesTemplate)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.kubernetesTemplate = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除吗?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteTemplateKubernete(row.id).then(response => {
            const { data } = response
            this.kubernetesTemplateList.splice($index, 1)
            this.$notify({
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: `<div>ID: ${data.id}</div><div>名称: ${data.name}</div>`,
              type: 'success'
            })
            this.dialogVisible = false
            this.getTemplates()
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        updateTemplateKubernete(this.kubernetesTemplate.id, this.kubernetesTemplate).then(response => {
          const { data } = response
          this.$notify({
            title: '成功',
            dangerouslyUseHTMLString: true,
            message: `<div>ID: ${data.id}</div><div>名称: ${data.name}</div>`,
            type: 'success'
          })
        })
      } else {
        addTemplateKubernete(this.kubernetesTemplate).then(response => {
          const { data } = response
          this.$notify({
            title: '成功',
            dangerouslyUseHTMLString: true,
            message: `<div>项目ID: ${data.id}</div><div>项目名称: ${data.name}</div>`,
            type: 'success'
          })
        })
      }
      this.dialogVisible = false
      this.getTemplates()
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
