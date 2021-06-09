<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="权限"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
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
      :data="list"
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
      <el-table-column label="关联模型" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.permission_rule | contentFilter(data_permission) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作方式" align="center">
        <template slot-scope="{row}">
          <span v-if="row.operate_type">{{ row.operate_type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联列" align="center">
        <template slot-scope="{row}">
          <span>{{ row.check_field }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联列值" align="center">
        <template slot-scope="{row}">
          <el-tag> {{ row.value }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" :disabled=" ! 'PUT' in row.button" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button size="mini" type="danger" :disabled=" ! 'DELETE' in row.button" @click="handleDelete(row,$index)">
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
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="140px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="数据模型规则" prop="permission_rule">
          <el-select
            v-model="temp.permission_rule"
            filterable
            allow-create
            default-first-option
            placeholder="请选择数据模型"
            @change="getFields(temp.permission_rule)"
          >
            <el-option
              v-for="(value, key) in data_permission"
              :key="key"
              :label="value.name"
              :value="value.id"
            >
              <a>数据规则名称：{{ value.name }}</a>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运算方式" prop="operate_type">
          <el-select
            v-model="temp.operate_type"
            filterable
            allow-create
            default-first-option
            placeholder="请输入操作类型"
          >
            <el-option
              v-for="(value, key, index) in operOption"
              :key="index"
              :label="value"
              :value="key"
            >
              <a>{{ value }}</a>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联列" prop="check_field">
          <el-select
            v-model="temp.check_field"
            filterable
            allow-create
            default-first-option
            placeholder="请选择数据模型"
            @change="getModelFieldValue(temp.permission_rule,temp.check_field)"
          >
            <template v-for="(value, key, index) in check_fields">
              <el-option
                :key="index"
                :label="value"
                :value="key"
                :aria-selected="key === temp.check_field"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="关联列值" prop="value">
          <el-select
            v-model="temp.value"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择请求方式"
          >
            <el-option
              v-for="(item, key) in field_value"
              :key="key"
              :label="item"
              :value="item"
            />
          </el-select>
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
  getDataPermissionLists,
  updateDataPermissionList,
  deleteDataPermissionList,
  addDataPermissionList,
  getModelFields,
  // getDataPermissionList,
  getModelFieldValues
} from '@/api/data_permission_list'
import { getDataPermissions } from '@/api/data_permission'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
// import { constantRoutes } from "@/router"; // secondary package based on el-pagination
export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    contentFilter(content, contents) {
      const map = {}
      contents.map((item) => {
        map[item.id] = item['name']
      })
      return map[content]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      post: null,
      data_permission: [],
      check_fields: [],
      field_value: [],
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
      operOption: {
        'eq': '等于',
        'gt': '大于',
        'le': '小于'
      },
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        permission_rule: '',
        operate_type: [],
        check_field: [],
        value: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改数据权限',
        create: '添加数据权限'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        permission_rule: [{
          required: true, message: '数据权限名称必须填写!', trigger: 'blur'
        }],
        operate_type: [{
          required: true, message: '关联数据模型必须填写！', trigger: 'blur'
        }],
        check_field: [{
          required: true, message: '请求方式必须填写！', trigger: 'blur'
        }],
        value: [{
          required: true, message: '权限范围必须填写！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  watch: {
    'temp.permission_rule': {
      handler(newValue, oldValue) {
        // this.temp.check_field = ''
        // this.temp.value = ''
        this.field_value = []
        this.check_fields = []
      }
    },
    'temp.check_field': {
      handler(newValue, oldValue) {
        // this.temp.value = ''
        this.field_value = []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getModelFieldValue(id, value) {
      if (value !== '' && value !== 'undefined' && id !== '' && id !== 'undefined' && id.length !== 0) {
        await getModelFieldValues(id, value).then(response => {
          this.field_value = response.data
        })
      }
    },
    async getFields(value) {
      if (value !== '' && value !== 'undefined' && value.length !== 0) {
        await getModelFields(value).then(response => {
          this.check_fields = response.data
        })
      }
    },
    async getModelFieldsOption(id, value) {
      if (value !== '' && value !== 'undefined' && id !== '' && id !== 'undefined' && id.length !== 0) {
        await getModelFields(id).then(response => {
          this.check_fields = response.data
        })
      }
      if (value !== '' && value !== 'undefined' && id !== '' && id !== 'undefined' && id.length !== 0) {
        await getModelFieldValues(id, value).then(response => {
          this.field_value = response.data
        })
      }
    },
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.level === '') {
        this.listQuery.level = undefined
      }
      getDataPermissions().then(response => {
        this.data_permission = response.data
      })
      getDataPermissionLists(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.post = response.meta.post_tag

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
        permission_rule: '',
        operate_type: '',
        value: '',
        check_field: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 + parseInt(Math.random() * 100) * 1000000 // mock a id
          if (typeof this.temp.value === typeof []) {
            this.temp.value = this.temp.value.join(',')
          }
          addDataPermissionList(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.getModelFieldsOption(this.temp.permission_rule, this.temp.check_field)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (typeof this.temp.value === typeof []) {
            this.temp.value = this.temp.value.join(',')
          }
          const tempData = Object.assign({}, this.temp)
          updateDataPermissionList(tempData.id, tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '修改权限成功：' + tempData.name,
              message: '修改权限成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteDataPermissionList(row.id).then(response => {
        const {
          meta
        } = response.data
        this.list.splice(meta, 1)
        // this.total = response.data.total
        this.$notify({
          title: '成功',
          message: meta.message,
          type: 'success',
          duration: 2000
        })

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
