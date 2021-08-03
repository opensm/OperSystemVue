<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-input
        v-model="listQuery.container"
        placeholder="发版名称"
        style="width: 300px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        style="margin-left: 10px;"
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
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        type="expand"
      >
        <template slot-scope="{row}">
          <el-form label-position="left" inline class="demo-table-expand">
            <template v-for="(item,key) in row.exec_list">
              <el-divider :key="key">流程ID:{{ item.id }}</el-divider>
              <el-form-item :key="key" label="更新参数">
                <span>{{ item.params }}</span>
              </el-form-item>
              <el-form-item :key="key" label="更新状态">
                <el-tag :type="item.status| tagFilter">{{ item.status|statusFilter }}</el-tag>
              </el-form-item>
              <el-form-item :key="key" label="输出信息">
                <span>{{ item.output }}</span>
              </el-form-item>
              <el-form-item :key="key" label="创建时间">
                <span>{{ item.create_time }}</span>
              </el-form-item>
              <el-form-item :key="key" label="完成时间">
                <span>{{ item.finish_time }}</span>
              </el-form-item>
            </template>
          </el-form>
        </template>
      </el-table-column>
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
      <el-table-column label="执行服务" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.container }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属项目" align="center">
        <template slot-scope="{row}">
          <span>{{ row.project_st }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="{row}">
          {{ row.create_user_st }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status| tagFilter">{{ row.status|statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <i
            class="el-icon-time"
          />
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" :disabled="! row.button.includes('PUT') || ! ['not_start_exec','unbond'].includes(row.status)" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button type="warning" size="mini" :disabled="post === false" @click="handleCopy(row)">
            拷贝
          </el-button>
          <el-button
            size="mini"
            type="danger"
            :disabled="! row.button.includes('DELETE') || ! ['not_start_exec','unbond'].includes(row.status)"
            @click="handleDelete(row,$index)"
          >
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 500px; margin-left:50px;"
      >
        <dynamic-form
          v-model="temp"
          size="medium"
          :descriptors="descriptors"
        />
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
  getSubtasks, deleteSubtask, updateSubtask, addSubtask, getTemplateValues
} from '@/api/subtask'
import waves from '@/directive/waves' // waves directive
import { getProjects } from '@/api/project'
import Pagination from '@/components/Pagination'
import DynamicForm from 'vue-dynamic-form-component'

export default {
  name: 'ComplexTable',
  components: {
    Pagination,
    DynamicForm
  },
  objectOptions: [],
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'not_start_exec': '任务还未开始',
        'progressing': '任务执行中',
        'success': '任务已完成',
        'fail': '任务失败',
        'unbond': '任务还未绑定'
      }
      return statusMap[status]
    },
    tagFilter(status) {
      const statusMap = {
        'not_start_exec': '',
        'progressing': 'warning',
        'success': 'success',
        'fail': 'danger',
        'unbond': 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      total: 0,
      post: true,
      project: [],
      projectList: [],
      list: [],
      template_obj: [],
      template_list: [],
      template_obj_list: [],
      objects: [],
      objectsList: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '-id',
        container: ''
      },
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      showReviewer: false,
      temp: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改子任务',
        create: '添加子任务'
      },
      dialogPvVisible: false,
      pvData: [],
      downloadLoading: false
    }
  },
  computed: {
    descriptors() {
      const that = this
      return {
        container: { type: 'string', required: true, label: '更新服务', message: '服务名称必须填', placeholder: '填入服务名称' },
        env: {
          type: 'enum',
          label: '环境',
          message: '所属请选择环境必须选择！',
          enum: ['prod', 'pre', 'dev'],
          required: true,
          options: [{ 'label': '预生产', 'value': 'pre' }, { 'label': '生产', 'value': 'prod' }],
          placeholder: '请选择环境'
        },
        project: {
          type: 'enum',
          label: '相关项目',
          message: '所属项目必须选择！',
          enum: this.project,
          required: true,
          options: this.projectList,
          placeholder: '选择项目'
        },
        note: { type: 'string', required: true, label: '备注', message: '备注必填！', placeholder: '填入备注' },
        exec_list: {
          type: 'array',
          label: '操作列表',
          required: true,
          message: '操作列表必须填写！',
          defaultField: {
            type: 'object',
            fields: {
              params: { type: 'string', required: true, label: '更新参数', message: '更新参数必填', placeholder: '更新参数' },
              content_type: {
                type: 'enum',
                label: '模板类型',
                enum: that.template_obj,
                required: true,
                message: '模板类型必须选择！',
                placeholder: '请选择模板类型',
                events: {
                  change(event) {
                    console.log(that.temp)
                    console.log(that.temp.exec_list)
                    console.log()
                    that.objects = []
                    that.objectsList = []
                    that.template_obj_list.map(item => {
                      if (item.value === event) {
                        item.template.map(data => {
                          that.objects.push(data.id)
                          that.objectsList.push({ 'label': data.id + ':' + data.name, 'value': data.id })
                        })
                      } else {
                        item.template.map(data => {
                          that.objects.push(data.id)
                          that.objectsList.push({ 'label': data.id + ':' + data.name, 'value': data.id, 'disabled': true })
                        })
                      }
                    })
                  }
                },
                options: that.template_list
              },
              object_id: {
                type: 'enum',
                label: '模板选择',
                enum: that.objects,
                required: true,
                message: '模板必须选择！',
                placeholder: '选择模板',
                options: that.objectsList
              }
            }
          }
        }
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getTemplates() {
      getTemplateValues().then(response => {
        const { data } = response
        this.template_obj_list = data
        data.map(item => {
          this.template_obj.push(item.value)
          this.template_list.push({ 'label': item.label, 'value': item.value })
        })
        this.template_obj = JSON.parse(JSON.stringify(this.template_obj))
        this.template_list = JSON.parse(JSON.stringify(this.template_list))
      })
    },
    getProjects() {
      getProjects().then(response => {
        const { data } = response
        data.map(item => {
          this.project.push(item.id)
          this.projectList.push({ 'label': item.id + ':' + item.name, 'value': item.id })
        })
        this.project = JSON.parse(JSON.stringify(this.project))
      })
    },
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.container === '') {
        this.listQuery.container = undefined
      }
      getSubtasks(this.listQuery).then(response => {
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
        message: '操作成功！',
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
    format_time() {
      const yy = new Date().getFullYear()
      const mm = new Date().getMonth() + 1
      const dd = new Date().getDate()
      const hh = new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours()
      const mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
      return `${yy}${mm}${dd}${hh}${mf}`
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        container: '',
        exec_list: [],
        note: '',
        project: '',
        create_user: '',
        create_time: '',
        finish_time: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.projectList = []
      this.template_list = []
      this.getProjects()
      this.getTemplates()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCopy(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.projectList = []
      this.template_list = []
      this.getProjects()
      this.getTemplates()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.temp.env = this.temp.container.split('_')[1]
      this.temp.container = this.temp.container.split('_')[2]
      const { exec_list } = this.temp
      this.temp.exec_list = []
      exec_list.map(item => {
        item.status = 'not_start_exec'
        item.output = ''
        item.finish_time = ''
        this.temp.exec_list.push(item)
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const local_time = this.format_time()
          this.temp.container = local_time + '_' + this.temp.env + '_' + this.temp.container
          addSubtask(this.temp).then(response => {
            const { meta } = response
            this.list.unshift(this.temp)
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
      this.projectList = []
      this.template_list = []
      this.getProjects()
      this.getTemplates()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.temp.env = this.temp.container.split('_')[1]
      this.temp.container = this.temp.container.split('_')[2]
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // const tempData = Object.assign({}, this.temp)
          const local_time = this.format_time()
          this.temp.container = local_time + '_' + this.temp.env + '_' + this.temp.container
          updateSubtask(this.temp.id, this.temp).then(response => {
            const { meta } = response
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
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
    handleDelete(row, index) {
      deleteSubtask(row.id).then(response => {
        const { meta } = response
        this.list.splice(index, 1)
        this.$notify({
          title: '成功',
          message: meta.msg,
          type: 'success',
          duration: 2000
        })
        this.dialogFormVisible = false
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

<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
