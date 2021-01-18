<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="序号" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="角色">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="父菜单">
        <template slot-scope="scope">
          {{ scope.row.parent }}
        </template>
      </el-table-column>
      <el-table-column label="图标" width="110" align="center">
        <template slot-scope="scope">
          <svg :class="svgClass" aria-hidden="true" v-on="$listeners">
            <use :xlink:href="iconName( scope.row.icon )"/>
          </svg>
        </template>
      </el-table-column>
      <el-table-column label="资源" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.resource }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单等级" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="删除" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_date }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {getPermissionsList} from '@/api/table'
import {isExternal} from "@/utils/validate";

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        'true': 'success',
        // draft: 'gray',
        'false': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      getPermissionsList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    iconName(iconClass) {
      return `#icon-${iconClass}`
    }
  },
  computed: {
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + this.className
      } else {
        return 'svg-icon'
      }
    },
    // styleExternalIcon() {
    //   return {
    //     mask: `url(${this.iconClass}) no-repeat 50% 50%`,
    //     '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`
    //   }
    // }
  }
}
</script>
