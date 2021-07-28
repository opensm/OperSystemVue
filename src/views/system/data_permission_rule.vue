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
      <el-table-column label="权限" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资源model" align="center">
        <template slot-scope="{row}">
          <span v-if="row.content_type">应用程序标签：{{ row.app_label_set }},数据模型：{{ row.model_set }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.request_type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否是全部资源" align="center" width="auto">
        <template slot-scope="{row}">
          <el-tag> {{ row.is_all }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" :disabled=" ! row.button.includes('PUT')" @click="handleUpdate(row)">
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
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="权限" prop="name">
          <el-input
            v-model="temp.name"
          />
        </el-form-item>
        <el-form-item label="数据模型" prop="content_type">
          <el-select
            v-model="temp.content_type"
            filterable
            allow-create
            default-first-option
            placeholder="请选择数据模型"
          >
            <el-option
              v-for="(value, key) in content"
              :key="key"
              :label="value.model"
              :value="value.id"
            >
              <a>应用程序标签：{{ value.app_label }},数据模型：{{ value.model }}</a>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请求方式" prop="request_type">
          <el-select
            v-model="temp.request_type"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择请求方式"
          >
            <el-option
              v-for="(value, key) in requestTypeoption"
              :key="key"
              :label="value.name"
              :value="value.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="全部资源" prop="is_all">
          <el-tooltip :content="'全部权限？: ' + temp.is_all" placement="top">
            <el-switch
              v-model="temp.is_all"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-tooltip>
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
  getDataPermissions, addDataPermission, updateDataPermission, deleteDataPermission, getContentType
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

const requestTypeoption = [
  { 'id': 1, 'name': '添加', 'method': 'POST' },
  { 'id': 2, 'name': '查看', 'method': 'GET' },
  { 'id': 3, 'name': '删除', 'method': 'DELETE' },
  { 'id': 4, 'name': '修改', 'method': 'PUT' }
]

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
        map[item.id] = '应用程序标签:' + item['app_label'] + ';' + '数据模型:' + item['model']
      })
      return map[content]
    },
    typeFilter(roles) {
      const map = {}
      requestTypeoption.map((item) => {
        map[item.id] = item.name
      })

      return roles.map((item) => map[item]).join(',')
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      post: null,
      content: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        level: undefined,
        sort: '+id'
      },
      requestTypeoption,
      calendarHiddenOptions,
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        content_type: '',
        request_type: [],
        is_all: false
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
  },
  methods: {
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.level === '') {
        this.listQuery.level = undefined
      }
      getDataPermissions(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.post = response.meta.post_tag
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getContent() {
      getContentType().then(response => {
        this.content = response.data
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
        name: '',
        content_type: '',
        request_type: [],
        is_all: false
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.getContent()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addDataPermission(this.temp).then(response => {
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
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.getContent()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateDataPermission(tempData.id, tempData).then(response => {
            const { meta } = response
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.$notify({
              title: '修改权限成功',
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
        this.handleFilter()

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
