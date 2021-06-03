<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="发版名称"
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
        :disabled="post ==='false'"
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
            <el-form-item label="任务ID">
              <span>{{ row.id }}</span>
            </el-form-item>
            <el-form-item label="任务名称">
              <span>{{ row.name }}</span>
            </el-form-item>
            <el-form-item label="审批流程">
              <span>{{ row.approve_flow }}</span>
            </el-form-item>
            <el-form-item label="所属项目">
              <span>{{ row.project | dataList(project) }}</span>
            </el-form-item>
            <el-form-item label="创建用户">
              <span>{{ row.create_user|dataList(userList) }}</span>
            </el-form-item>
            <el-form-item label="状态">
              <span>{{ row.status|statusFilter }}</span>
            </el-form-item>
            <el-form-item label="任务时间">
              <span>{{ row.task_time }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ row.create_time }}</span>
            </el-form-item>
            <el-form-item label="完成时间">
              <span>{{ row.finish_time }}</span>
            </el-form-item>
            <el-form-item label="备注">
              <span>{{ row.note }}</span>
            </el-form-item>
            <el-form-item label="关联子任务">
              <span>{{ row.sub_task | subTaskFilter(subTaskList) }}</span>
            </el-form-item>
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
      <el-table-column label="任务名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批流程" align="center">
        <template slot-scope="{row}">
          <span>{{ row.approve_flow }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属项目" align="center">
        <template slot-scope="{row}">
          <span>{{ row.project | dataList(project) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="{row}">
          {{ row.create_user|dataList(userList) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status|tagFilter">{{ row.status|statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务时间" align="center">
        <template slot-scope="{row}">
          <i
            class="el-icon-time"
          />
          <span>{{ row.task_time }}</span>
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
        <el-form-item label="任务名称" prop="name">
          <el-input
            v-model="temp.name"
          />
        </el-form-item>
        <el-form-item label="项目" prop="project">
          <el-select
            v-model="temp.project"
            filterable
            allow-create
            default-first-option
            placeholder="请选择项目"
          >
            <el-option
              v-for="item in project"
              :key="item.id"
              :label="item.id + ':' + item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审批流程" prop="approve_flow">
          <el-input
            v-model="temp.approve_flow"
          />
        </el-form-item>
        <el-form-item label="任务时间" prop="task_time">
          <el-date-picker
            v-model="temp.task_time"
            type="datetime"
            placeholder="选择日期时间"
            default-time="00:00:00"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 10}"
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="关联子任务" prop="sub_task">
          <el-checkbox-group v-model="temp.sub_task">
            <el-card v-for="(item,key) in subTaskList" :key="key" class="box-card" shadow="hover" style="margin-bottom: 10px">
              <el-checkbox :label="item.id" :value="item.id">
                <div>
                  {{ 'ID：' + item.id + '， 名称：' + item.container }}
                </div>
              </el-checkbox>
            </el-card>
          </el-checkbox-group>
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
  getTasks, deleteTask, updateTask, addTask
} from '@/api/task'
import waves from '@/directive/waves' // waves directive
import {
  getSubtasks
} from '@/api/subtask'
import { getProjects } from '@/api/project'
import { getUsersInfo } from '@/api/user'
import { current_user } from '@/api/user'
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
    statusFilter(status) {
      const statusMap = {
        'approveing': '审批中',
        'not_start_approve': '还未审批',
        'ok_approved': '审批通过',
        'fail_approve': '审批不通过',
        'not_start_exec': '任务还未开始',
        'progressing': '任务执行中',
        'success': '任务成功',
        'fail': '任务失败',
        'timeout': '任务已超时',
        'unsubmit': '未提交'
      }
      return statusMap[status]
    },
    statusChoice(status) {
      const valueMap = {
        'true': '是',
        'false': '否'
      }
      return valueMap[status]
    },
    subTaskFilter(subs, subTaskList) {
      const map = {}
      subTaskList.map((item) => {
        map[item.id] = item.container
      })
      return subs.map((item) => map[item]).join(',')
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
    },
    dataList(user, users) {
      const map = {}
      users.map((item) => {
        map[item.id] = item.name
      })

      return map[user]
    }
  },
  data() {
    return {
      tableKey: 0,
      total: 0,
      post: true,
      project: [],
      list: [],
      subTaskList: [],
      userList: [],
      create_user: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
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
        name: '',
        approve_flow: '',
        sub_task: [],
        note: '',
        project: '',
        create_user: '',
        developer: '',
        task_time: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改任务',
        create: '添加任务'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{
          required: true, message: '任务名称必须填写！', trigger: 'blur'
        }],
        approve_flow: [{
          required: true, message: '审批流程必须填写！', trigger: 'blur'
        }],
        note: [{
          required: true, message: '上线备注必须填写！', trigger: 'blur'
        }],
        project: [{
          required: true, message: '所属项目必须填写！', trigger: 'blur'
        }],
        task_time: [{
          required: true, message: '任务时间必须填写！', trigger: 'blur'
        }],
        sub_task: [{
          required: true, message: '子任务信息必须填写！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getProjects()
  },
  methods: {
    getProjects() {
      getProjects().then(response => {
        this.project = response.data
      })
    },
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.name === '') {
        this.listQuery.name = undefined
      }
      getTasks(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.post = response.meta.post_tag

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      getSubtasks({ 'status': 'unbond' }).then(response => {
        this.subTaskList = response.data
      })
      current_user().then(response => {
        const { data } = response
        this.create_user = data.id
      })
      getUsersInfo().then(response => {
        this.userList = response.data
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
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        approve_flow: '',
        sub_task: [],
        note: '',
        project: ''
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
          this.temp.create_user = this.create_user
          this.temp.task_time = this.moment(this.temp.task_time).format('YYYY-MM-DD HH:mm:ss')
          this.getList()
          addTask(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建用户成功',
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
          tempData.task_time = this.moment(tempData.task_time).format('YYYY-MM-DD HH:mm:ss')
          updateTask(tempData.id, tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功' + tempData.name,
              message: '修改成功:' + tempData.name,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteTask(row.id).then(response => {
        const {
          meta
        } = response.data
        this.list.splice(index, 1)
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
