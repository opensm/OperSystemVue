<template>
  <div class="app-container">
    <div class="filter-container">
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
      :data="flowNodeList"
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
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批流程组" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.flow_st }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批角色" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.role_st }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center">
        <template slot-scope="{row}">
          <span>{{ row.level }}</span>
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
      @pagination="getNodeList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="审批流程组" prop="flow">
          <el-select
            v-model="temp.flow"
            filterable
            default-first-option
            placeholder="请选择审批流程组"
          >
            <el-option
              v-for="item in flowEngine"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审批角色" prop="approval_role">
          <el-select
            v-model="temp.approval_role"
            filterable
            default-first-option
            placeholder="请选择审批角色"
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="level">
          <el-input-number
            v-model="temp.level"
            :step="1"
          >
          </el-input-number>
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
import {
  getFlowNodes, deleteFlowNode, updateFlowNode, addFlowNode
} from '@/api/flow_node'
import {
  getFlowEngines
} from '@/api/flow_engine'
import {
  getRoles
} from '@/api/role'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    statusChoice(status) {
      const valueMap = {
        'true': '是',
        'false': '否'
      }
      return valueMap[status]
    },
    dataList(data, dataList) {
      const map = {}
      dataList.map((item) => {
        map[item.id] = item.name
      })

      return map[data]
    }
  },
  data() {
    return {
      tableKey: 0,
      flowEngine: [],
      total: 0,
      post: null,
      flowNodeList: [],
      roleList: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        level: undefined,
        sort: '+id'
      },
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      showReviewer: false,
      temp: {
        id: undefined,
        flow: '',
        approval_role: '',
        level: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改流程',
        create: '添加流程'
      },
      rules: {
        flow: [{
          required: true, message: '关联审批流引擎必须填写！', trigger: 'blur'
        }],
        approval_role: [{
          required: true, message: '审批角色必须填写！', trigger: 'blur'
        }],
        level: [{
          required: true, message: '操作优先级必须选择！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getNodeList()
    this.getEngine()
  },
  methods: {
    getNodeList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.level === '') {
        this.listQuery.level = undefined
      }
      getFlowNodes(this.listQuery).then(response => {
        this.flowNodeList = response.data
        this.total = response.total
        this.post = response.meta.post_tag

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getRoles() {
      getRoles().then(response => {
        const { data } = response
        this.roleList = data
      })
    },
    getEngine() {
      getFlowEngines().then(response => {
        const { data } = response
        this.flowEngine = data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getNodeList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
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
    resetTemp() {
      this.temp = {
        id: undefined,
        flow: '',
        approval_role: '',
        level: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.getRoles()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addFlowNode(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建用户成功',
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
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.getRoles()
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
          updateFlowNode(tempData.id, tempData).then(() => {
            this.$notify({
              title: '成功',
              message: '修改成功:' + tempData.flow_st,
              type: 'success',
              duration: 2000
            })
            this.dialogFormVisible = false
            this.handleFilter()
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteFlowNode(row.id).then(response => {
        const {
          meta
        } = response
        // this.total = response.data.total
        this.$notify({
          title: '成功',
          message: meta.msg,
          type: 'success',
          duration: 2000
        })
        this.handleFilter()
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
