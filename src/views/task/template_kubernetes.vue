<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="模板名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        :disabled="post === false"
        @click="handleCreate"
      >
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="kubernetesTemplateList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="100"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联密钥" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.instance_st }}</span>
        </template>
      </el-table-column>
      <el-table-column label="命名空间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.namespace }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用名称" align="center">
        <template slot-scope="{row}">
          {{ row.app_name }}
        </template>
      </el-table-column>
      <el-table-column label="调用类" align="center">
        <template slot-scope="{row}">
          {{ row.exec_class }}
        </template>
      </el-table-column>
      <el-table-column label="调用方法" align="center">
        <template slot-scope="{row}">
          {{ row.exec_function }}
        </template>
      </el-table-column>
      <el-table-column label="操作方式" align="center">
        <template slot-scope="{row}">
          {{ row.control_type }}
        </template>
      </el-table-column>
      <el-table-column label="yaml模板" align="center">
        <template slot-scope="{row}">
          {{ row.yaml }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="标签">
        <template slot-scope="{row}">
          {{ row.label }}
        </template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="{row}">
          {{ row.create_user_st }}
        </template>
      </el-table-column>
      <el-table-column label="创建日期" align="center">
        <template slot-scope="{row}">
          <i
            class="el-icon-time"
          />
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" :disabled="! row.button.includes('PUT')" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button size="mini" type="danger" :disabled="! row.button.includes('DELETE')" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getTemplates"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="kubernetesTemplate"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input
            v-model="kubernetesTemplate.name"
            placeholder="请输入模板名称"
          />
        </el-form-item>
        <el-form-item label="集群" prop="cluster">
          <el-select
            v-model="kubernetesTemplate.cluster"
            filterable
            default-first-option
            placeholder="请选择集群"
          >
            <el-option
              v-for="item in clusters"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="命名空间" prop="namespace">
          <el-input
            v-model="kubernetesTemplate.namespace"
            placeholder="请填入命名空间"
          />
        </el-form-item>
        <el-form-item label="应用名称" prop="app_name">
          <el-input
            v-model="kubernetesTemplate.app_name"
            placeholder="请填入应用名称"
          />
        </el-form-item>
        <el-form-item label="调用类" prop="exec_class">
          <el-input
            v-model="kubernetesTemplate.exec_class"
            placeholder="请填入调用类"
          />
        </el-form-item>
        <el-form-item label="调用方法" prop="exec_function">
          <el-input
            v-model="kubernetesTemplate.exec_function"
            placeholder="请填入调用方法"
          />
        </el-form-item>
        <el-form-item label="标签" prop="label">
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { getTemplateKubernetes, updateTemplateKubernete, addTemplateKubernete, deleteTemplateKubernete } from '@/api/templatekubernetes'
import { getAuthKEYs } from '@/api/auth_key'
import Pagination from '@/components/Pagination'

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
  create_user: ''
}

export default {
  name: 'ComplexTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      total: 0,
      post: false,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        level: undefined,
        sort: '-id'
      },
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      kubernetesTemplate: Object.assign({}, defaultTemplate),
      kubernetesTemplateList: [],
      control_type: { 'create': '创建', 'update': '更新', 'delete': '删除' },
      clusters: [],
      users: [],
      user: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改模板',
        create: '添加模板'
      },
      rules: {
        name: [{
          required: true, message: '模板名称必须填写!', trigger: 'blur'
        }],
        cluster: [{
          required: true, message: '关联集群必须填写！', trigger: 'blur'
        }],
        namespace: [{
          required: true, message: '命名空间必须填写！', trigger: 'blur'
        }],
        app_name: [{
          required: true, message: '应用名称必须填写！', trigger: 'blur'
        }],
        exec_class: [{
          required: true, message: '操作类必须填写！', trigger: 'blur'
        }],
        exec_function: [{
          required: true, message: '操作方法必须选择！', trigger: 'blur'
        }],
        label: [{
          required: true, message: '标签地址必填！', trigger: 'blur'
        }],
        control_type: [{
          required: true, message: '更新方式地址必填！', trigger: 'blur'
        }],
        yaml: [{
          required: true, message: 'yaml内容地址必填！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getTemplates()
  },
  methods: {
    getTemplates() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.level === '') {
        this.listQuery.level = undefined
      }
      getTemplateKubernetes(this.listQuery).then(response => {
        const { data, total, meta } = response
        this.kubernetesTemplateList = data
        this.total = total
        this.post = meta.post_tag
      })
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 1.5 * 1000)
    },
    getClusters() {
      getAuthKEYs({ 'auth_type': 'Kubernetes' }).then(response => {
        const { data } = response
        this.clusters = data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getTemplates()
    },
    sortChange(data) {
      const {
        prop, order
      } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleCreate() {
      this.kubernetesTemplate = Object.assign({}, this.kubernetesTemplate)
      this.getClusters()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addTemplateKubernete(this.kubernetesTemplate).then(response => {
            const { meta } = response
            this.$notify({
              title: '成功',
              message: meta.msg,
              type: 'success',
              duration: 2000
            })
            this.dialogFormVisible = false
            this.handleFilter()
          })
        }
      })
    },
    handleUpdate(row) {
      this.kubernetesTemplate = Object.assign({}, row) // copy obj
      this.getClusters()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log(tempData)
          updateTemplateKubernete(tempData.id, tempData).then(response => {
            const { meta } = response
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.$notify({
              title: '成功',
              message: meta.msg,
              type: 'success',
              duration: 2000
            })
            this.handleFilter()
            this.dialogFormVisible = false
          })
        }
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
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
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
