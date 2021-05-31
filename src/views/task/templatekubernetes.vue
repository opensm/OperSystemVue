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
          {{ scope.row.cluster }}
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
      <el-table-column align="header-center" label="创建用户">
        <template slot-scope="scope">
          {{ scope.row.create_user }}
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
            @click="handleEdit(scope)">
            修改
          </el-button>
          <el-button
            type="danger"
            size="small"
            :disabled=" ! scope.row.button.includes('DELETE')"
            @click="handleDelete(scope)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑模板':'新增模板'">
      <el-form :model="kubernetesTemplate" label-width="100px" label-position="left">
        <el-form-item label="模板名称">
          <el-input v-model="kubernetesTemplate.name" placeholder="模板名称"/>
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
          <el-input v-model="kubernetesTemplate.namespace" placeholder="请填入命名空间"/>
        </el-form-item>
        <el-form-item label="应用名称">
          <el-input v-model="kubernetesTemplate.app_name" placeholder="请填入应用名称"/>
        </el-form-item>
        <el-form-item label="调用类">
          <el-input v-model="kubernetesTemplate.exec_class" placeholder="请填入调用类"/>
        </el-form-item>
        <el-form-item label="调用方法">
          <el-input v-model="kubernetesTemplate.exec_function" placeholder="请填入调用方法"/>
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
          <el-input v-model="kubernetesTemplate.yaml" placeholder="请填入yaml模板"/>
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
import { getUsersInfo, current_user } from '@/api/user'

const defaultTemplate = {
  id: '',
  name: '',
  cluster: '',
  namespace: '',
  app_name: '',
  control_type: '',
  yaml: '',
  exec_class: '',
  exec_function: '',
  create_user: ''
}
export default {
  data() {
    return {
      kubernetesTemplate: Object.assign({}, defaultTemplate),
      kubernetesTemplateList: [],
      control_type: { 'create': '创建', 'update': '更新', 'delete': '删除' },
      clusters: [],
      users: [],
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
    this.getCurrentUser()
    this.getUsers()
  },
  methods: {
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
    getUsers() {
      getUsersInfo().then(response => {
        const { data } = response
        this.users = data
      })
    },
    getCurrentUser() {
      current_user().then(response => {
        const { data } = response
        this.user = data.id
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
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除吗?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteTemplateKubernete(row.id)
          this.kubernetesTemplateList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      this.kubernetesTemplate.create_user = this.user
      if (isEdit) {
        await updateTemplateKubernete(this.kubernetesTemplate.id, this.kubernetesTemplate)
      } else {
        const { data } = await addTemplateKubernete(this.kubernetesTemplate)
        this.kubernetesTemplate.id = data.id
        this.kubernetesTemplateList.push(this.role)
      }
      const { id, name } = this.kubernetesTemplate
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>模板ID: ${id}</div>
            <div>模板名称: ${name}</div>`,
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
