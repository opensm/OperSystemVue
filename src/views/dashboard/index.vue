<template>
  <div class="dashboard-container">
<!--    <div class="dashboard-text">姓名: {{ name }}</div>-->
<!--    <div class="dashboard-text">角色: <span v-for="role in roles" :key="role">{{ role }}</span></div>-->
    <el-row :gutter="12">
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="当前角色" :total="getRoleName()">
          <el-tooltip slot="action" class="item" effect="dark" content="当前角色名称" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="上次登录" :total="getLastLogin()">
          <el-tooltip slot="action" class="item" effect="dark" content="上次登录日期" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="待审核工单" :total="getUnCommit">
          <el-tooltip slot="action" class="item" effect="dark" content="需要审批的工单数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="任务个数" :total="taskTotal">
          <el-tooltip slot="action" class="item" effect="dark" content="任务个数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="任务进行中个数" :total="runningTaskTotal">
          <el-tooltip slot="action" class="item" effect="dark" content="任务进行中个数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="任务成功个数" :total="successTaskTotal">
          <el-tooltip slot="action" class="item" effect="dark" content="任务成功个数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="任务失败个数" :total="failedTaskTotal">
          <el-tooltip slot="action" class="item" effect="dark" content="失败的任务个数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="子任务个数" :total="subTaskTotal">
          <el-tooltip slot="action" class="item" effect="dark" content="子任务个数" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </chart-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ChartCard from '@/components/ChartCard'
import { getFlowTasks } from '@/api/flow_task'
import { getTasks } from '@/api/task'
import { getSubtasks } from '@/api/subtask'

export default {
  name: 'Dashboard',
  components: {
    ChartCard
  },
  data() {
    return {
      subTaskTotal: 0,
      flowTaskTotal: 0,
      taskTotal: 0,
      runningTaskTotal: 0,
      successTaskTotal: 0,
      failedTaskTotal: 0,
      unCommit: 0,
      commit: 0
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles',
      'role_name',
      'last'
    ]),
    getUnCommit: function() {
      return this.flowTaskTotal - (this.unCommit + this.commit)
    }
  },
  created() {
    this.getTotalTask()
    this.getSuccessTask()
    this.getRunningTask()
    this.getFailedTask()
    this.getFlowTaskTotal()
    this.getSubTask()
    this.getFlowTaskCommitTotal()
  },
  methods: {
    getLastLogin() {
      return this.last
    },
    getFlowTaskTotal() {
      getFlowTasks().then(response => {
        const { total } = response
        this.flowTaskTotal = total
      })
      return this.flowTaskTotal
    },
    getFlowTaskCommitTotal() {
      getFlowTasks({ 'status': 'pass' }).then(response => {
        const { total } = response
        this.commit = total
      })
      getFlowTasks({ 'status': 'refuse' }).then(response => {
        const { total } = response
        this.unCommit = total
      })
    },
    getRoleName() {
      return this.role_name
    },
    getTotalTask() {
      getTasks().then(response => {
        const { total } = response
        this.taskTotal = total
      })
    },
    getRunningTask() {
      getTasks({ 'status': 'progressing' }).then(response => {
        const { total } = response
        this.runningTaskTotal = total
      })
    },
    getSuccessTask() {
      getTasks({ 'status': 'success' }).then(response => {
        const { total } = response
        this.successTaskTotal = total
      })
    },
    getFailedTask() {
      getTasks({ 'status': 'fail' }).then(response => {
        const { total } = response
        this.failedTaskTotal = total
      })
    },
    getSubTask() {
      getSubtasks().then(response => {
        const { total } = response
        this.subTaskTotal = total
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
