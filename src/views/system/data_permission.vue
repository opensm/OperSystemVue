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
      <el-select v-model="listQuery.level" placeholder="菜单等级" clearable class="filter-item" style="width: 130px">
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.level"
          :label="item.display_name+'('+item.level+')'"
          :value="item.level"
        />
      </el-select>
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
      <el-table-column label="权限" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资源model" align="center">
        <template slot-scope="{row}">
          <span v-if="row.content_type">{{ row.content_type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.request_type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否是全部资源" align="center">
        <template slot-scope="{row}">
          <el-tag> {{ row.is_all }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
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
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="权限" prop="name">
          <el-input
            v-model="temp.name"
          />
        </el-form-item>
        <el-form-item label="url" prop="content_type">
          <el-input
            v-model="temp.content_type"
          />
        </el-form-item>
        <el-form-item label="显示序列" prop="request_type">
          <el-select
            v-model="temp.request_type"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择角色"
          >
            <el-option
              v-for="item in temp.request_type"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="全部资源" prop="is_all">
          <el-switch
            v-model="temp.is_all"
            active-color="#13ce66"
            inactive-color="#ff4949"
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
import {
  getDataPermissions, addDataPermission, updateDataPermission, deleteDataPermission
} from '@/api/data_permission'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
// import { constantRoutes } from "@/router"; // secondary package based on el-pagination

const calendarHiddenOptions = [
  {
    hidden: 'true', display_name: '隐藏', index: 1
  }, {
    hidden: 'false', display_name: '不隐藏', index: 0
  }
]

const calendarTypeOptions = [
  {
    level: 0, display_name: '一级菜单'
  },
  {
    level: 1, display_name: '二级菜单'
  },
  {
    level: 2, display_name: '三级菜单'
  },
  {
    level: 3, display_name: '四级菜单'
  },
  {
    level: 999, display_name: '按钮权限'
  }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.level] = cur.display_name
  return acc
}, {})
const calendarHiddenKeyValue = calendarHiddenOptions.reduce((acc, cur) => {
  acc[cur.hidden] = cur.display_name
  return acc
}, {})

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
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    },
    hiddenFilter(hidden) {
      return calendarHiddenKeyValue[hidden]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10,
        limit: this.size,
        level: undefined,
        sort: '+id'
      },
      calendarTypeOptions,
      calendarHiddenOptions,
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      showReviewer: false,
      iconOptions: [
        '404', 'bug', 'chart', 'clipboard', 'component', 'dashboard', 'documentation', 'drag', 'edit', 'education', 'email', 'example', 'excel', 'exit-fullscreen', 'eye-open', 'eye', 'form', 'fullscreen', 'guide', 'icon', 'international', 'language', 'link', 'list', 'lock', 'message', 'money', 'nested', 'password', 'pdf', 'people', 'peoples', 'qq', 'search', 'shopping', 'size', 'skill', 'star', 'tab', 'table', 'theme', 'tree-table', 'tree', 'user', 'wechat', 'zip'
      ],
      temp: {
        id: undefined,
        name: '',
        content_type: '',
        request_type: [],
        is_all: []
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
        name: [{
          required: true, message: '数据权限名称必须填写!', trigger: 'blur'
        }],
        content_type: [{
          required: true, message: '关联数据模型必须填写！', trigger: 'blur'
        }],
        request_type: [{
          required: true, message: '请求方式必须填写！', trigger: 'blur'
        }],
        is_all: [{
          required: true, message: '权限范围必须填写！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getMenu()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.size = this.listQuery.limit
      // 重置选择上的空
      if (this.listQuery.level === '') {
        this.listQuery.level = undefined
      }
      getDataPermissions(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total

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
        path: '',
        model: '',
        name: '',
        icon: '',
        level: '',
        parent: '',
        component: ''
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
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          addDataPermission(this.temp).then(() => {
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
      // this.temp.timestamp = new Date(this.temp.timestamp)
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
          updateDataPermission(tempData.id, tempData).then(() => {
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
      deleteDataPermission(row.id).then(response => {
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
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
