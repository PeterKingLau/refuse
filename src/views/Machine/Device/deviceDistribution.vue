<template>
  <!--- 搜索框-->
  <el-row class="rr">
    <el-form
      :model="SearchFormData"
      label-width="100px"
      :inline="true"
      v-if="showSearchForm"
      class="frame"
    >
      <el-form-item label="设备编号:" label-width="90">
        <el-input v-model="SearchFormData.deviceNumber" placeholder="请输入设备编号" />
      </el-form-item>

      <el-form-item label="设备名称:" label-width="90">
        <el-input v-model="SearchFormData.deviceName" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="设备区域" label-width="90">
        <el-select v-model="SearchFormData.deviceArea" placeholder="请选择设备区域">
          <el-option
            v-for="item in deviceAreaArray"
            :key="item.id"
            :label="item.areaName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备型号" label-width="90">
        <el-select v-model="SearchFormData.deviceType" placeholder="请选择设备型号">
          <el-option
            v-for="item in deviceTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="运营商" label-width="90">
        <el-select v-model="SearchFormData.departmentId" placeholder="请选择运营商">
          <el-option
            v-for="item in departmentArray"
            :key="item.id"
            :label="item.platform_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备状态" label-width="90">
        <el-select
          v-model="SearchFormData.deviceStatus"
          placeholder="请选择设备状态"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in deviceStatusArray"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="在线状态" label-width="90">
        <el-select
          v-model="SearchFormData.deviceOnLine"
          placeholder="请选择在线状态"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in OnLineOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="激活" label-width="90">
        <el-select
          v-model="SearchFormData.deviceAtivation"
          placeholder="请选择设备激活状态"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in Activation"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="IMEI:" label-width="90">
        <el-input v-model="SearchFormData.IMEI" placeholder="请输入设备IMEI" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="btn" @click="onSearch" v-hasPermi="Permission.sec">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button class="btn" @click="onReset">
          <el-icon class="el-icon--left"><RefreshRight /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-row>

  <!-- 操作按钮-->
  <el-row>
    <el-col :span="18">
      <el-button type="primary" class="btn" @click="OnClickAdd" v-hasPermi="Permission.add">
        <el-icon><Plus /> </el-icon>
        新增</el-button
      >

      <el-button type="primary" class="btn" @click="addBatch" v-hasPermi="Permission.add">
        <el-icon><Plus /> </el-icon>
        批量导入</el-button
      >

      <el-button
        type="success"
        class="btn"
        :disabled="disableLed"
        @click="setLedBatch"
        v-hasPermi="Permission.add"
      >
        <el-icon><Plus /> </el-icon>
        批量设置走字灯</el-button
      >

      <el-button
        type="primary"
        class="btn"
        :disabled="setBatchStatusDisable"
        @click="setStatusBatch"
        v-hasPermi="Permission.add"
      >
        <el-icon><Plus /> </el-icon>
        批量设置状态</el-button
      >

      <el-button
        type="success"
        class="btn"
        :disabled="setBatchStatusDisable"
        @click="doSetRuleBatch"
        v-hasPermi="Permission.add"
      >
        <el-icon><Plus /> </el-icon>
        批量设置运营规则</el-button
      >

      <el-button
        type="success"
        class="btn"
        :disabled="disableUpdate"
        v-hasPermi="Permission.rev"
        @click="doSetNotActive"
        ><el-icon><EditPen /></el-icon>批量设置未激活</el-button
      >
      <el-button
        type="danger"
        class="btn"
        :disabled="disableRemove"
        @click="deleteOfDetail"
        v-hasPermi="Permission.del"
        ><el-icon><Close /></el-icon>删除</el-button
      >

      <el-button type="success" class="btn" @click="onClickExport" v-hasPermi="Permission.rev"
        ><el-icon><EditPen /></el-icon>导出</el-button
      >
    </el-col>

    <el-col :span="6" style="text-align: right">
      <el-tooltip content="隐藏搜索" placement="top-start">
        <el-button circle @click="OnClickOfShowForm">
          <el-icon><Search /></el-icon
        ></el-button>
      </el-tooltip>
      <el-tooltip content="刷新" placement="top-start">
        <el-button circle @click="onPageRest">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-tooltip>
    </el-col>
  </el-row>

  <el-divider />
  <el-row>
    <el-table
      ref="areaTableRef"
      :data="TableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="运营商" width="100" property="department.platformName" />

      <el-table-column label="设备编号" width="160" property="serialNumber" />
      <el-table-column label="设备名称" width="100" property="name" />
      <el-table-column label="设备区域" width="100" property="area.areaName" />
      <el-table-column label="设备地址" width="160" property="address" />
      <el-table-column label="是否在线" width="160" property="isOnline" />
      <el-table-column label="imei" width="160" property="imei" />
      <el-table-column label="在线时间" width="160" v-slot="scope">
        {{ FormatDate(scope.row.onlineTime) }}
      </el-table-column>
      <el-table-column label="是否校准" width="160" v-slot="scope">
        <el-link type="primary" @click="onCorrect(scope.row)">{{
          ConvertCorrect(scope.row.correct)
        }}</el-link>
      </el-table-column>
      <el-table-column label="型号名称" width="180" property="deviceType.name" />
      <el-table-column label="数据大屏" width="180" v-slot="scope">
        <el-link type="primary" :src="scope.row.dd">数据大屏</el-link>
      </el-table-column>
      <el-table-column label="是否激活" width="160" v-slot="scope">
        {{ scope.row.activation == 0 ? '未激活' : '激活' }}
      </el-table-column>
      <el-table-column label="状态" width="180" v-slot="scope">
        {{ ConverStatus(scope.row.status) }}
      </el-table-column>
      <el-table-column label="修改时间" width="180" property="updateTime" />
      <el-table-column label="DTU固件编号" width="180" property="userSerial" />
      <el-table-column label="固件版本" width="180" property="version" />
      <el-table-column label="操作" v-slot="scope" width="150" fixed="right">
        <div class="buttonOfTables">
          <!-- <el-button size="small" type="success" @click="handleDetail(scope.row)">修改</el-button>
          <el-button size="small" type="danger" @click="handleRemove(scope.row)">删除</el-button> -->
          <el-link type="primary" @click="handleDetail(scope.row)" v-hasPermi="Permission.rev"
            >修改</el-link
          >
          <el-link type="primary" @click="handleRemove(scope.row)" v-hasPermi="Permission.del"
            >删除</el-link
          >
          <el-link type="primary" @click="setRule(scope.row)" v-hasPermi="Permission.rul"
            >运营规则</el-link
          >
          <el-link type="primary" @click="setNoWork(scope.row)" v-hasPermi="Permission.reg"
            >设置为未激活</el-link
          >
          <!-- <el-link type="primary" @click="upgrade(scope.row)">测试硬件升级</el-link> -->
          <el-link type="primary" @click="toDetail(scope.row)">详情</el-link>
          <el-link type="primary" @click="showMedium(scope.row)">广告媒体</el-link>
        </div>
      </el-table-column>
    </el-table>
  </el-row>
  <el-row>
    <el-col :span="18">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :small="small"
        :disabled="disabled"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleSizeChange"
      />
    </el-col>
  </el-row>

  <el-dialog v-model="dialogTableVisible" :title="dialogTitle">
    <el-form :model="AddDataForm" label-width="100px">
      <el-form-item label="设备型号">
        <el-select
          v-model="AddDataForm.deviceType"
          placeholder="请选择设备型号"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in deviceTypeArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备编号">
        <el-row>
          <!-- {{ prefix }} -->
          <el-input
            v-model="AddDataForm.SerialNumber"
            placeholder="请输入串号"
            style="width: 80%"
          />
        </el-row>
      </el-form-item>
      <el-form-item label="DTU固件编号">
        <el-input
          v-model="AddDataForm.userSerial"
          placeholder="请输入DTU固件编号(全智能安卓可不填写)"
        />
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="AddDataForm.name" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="LOGO">
        <el-upload
          class="avatar-uploader"
          :action="UpImageURL"
          :show-file-list="false"
          :on-success="handleUpdateSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="headObject"
        >
          <img v-if="AddDataForm.pic" :src="getImageURL(AddDataForm.pic)" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="登录方式">
        <el-checkbox v-model="AddDataForm.face" label="人脸认证" size="large" />
        <el-checkbox v-model="AddDataForm.phone" label="手机认证" size="large" />
        <el-checkbox v-model="AddDataForm.qcode" label="二维码认证" size="large" />
        <el-checkbox v-model="AddDataForm.card" label="刷卡认证" size="large" />
      </el-form-item>

      <el-form-item label="设备区域">
        <el-select
          v-model="AddDataForm.deviceArea"
          placeholder="请选择设备区域"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in deviceAreaArray"
            :key="item.id"
            :label="item.areaName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="运维人员">
        <el-select
          v-model="AddDataForm.mStaff"
          placeholder="请选择运维人员"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in staffArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="运营人员">
        <el-select
          v-model="AddDataForm.wStaff"
          placeholder="请选择运营人员"
          ref="pointTpteSelectRef"
        >
          <el-option
            v-for="item in staffArray"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="设备状态">
        <el-radio-group v-model="AddDataForm.status" class="ml-4">
          <el-radio :label="item.id" :key="item.id" v-for="item in statusList">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div style="width: 100%; margin-top: 10px; text-align: right">
      <span class="dialog-footer">
        <el-button @click="onCloseDialog">取消</el-button>
        <el-button type="primary" @click="onAddConfirm"> 确认 </el-button>
      </span>
    </div>
  </el-dialog>

  <el-dialog v-model="MapdialogVisible" title="校准" width="70%">
    <div class="map" id="container"> </div>
    <el-row class="inputRow">
      <el-col :span="23">
        <el-input v-model="markerAddr" class="addressInput" />
      </el-col>
      <el-col :span="1">
        <el-button type="default" @click="doAddressToCoordinate"
          ><el-icon><search /></el-icon
        ></el-button>
      </el-col>
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="MapdialogVisible = false">取消</el-button>
        <el-button type="primary" @click="DoCorrect"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>

  <!--设置运营规则dialog-->

  <el-dialog v-model="ruleDialogVisible" title="运营规则" width="50%">
    <el-form :model="ruleData" label-width="120px" class="frame">
      <el-row>
        <el-col>
          <el-form-item label="规则名称">
            <el-select
              v-model="ruleData.ruleId"
              placeholder="请选择运营规则"
              @change="onRuleSelect"
            >
              <el-option
                v-for="item in RuleArray"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div style="width: 100%">
        <el-scrollbar height="400px" style="width: 80%">
          <div v-for="item in warehouseRef" :key="item.id" class="scrollbar-demo-item">
            <el-row class="test">
              <el-col :span="8">
                <el-row>
                  <el-image
                    style="width: 300px; height: 150px"
                    :src="getImageURL(item.pic)"
                    fit="fill"
                  />
                </el-row>
              </el-col>
              <el-col :span="16">
                <el-row>
                  <el-col :span="8"> 仓位编号: </el-col>
                  <el-col :span="16"> {{ item.code }} </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8"> 类型名称: </el-col>
                  <el-col :span="16">
                    {{ item.macGarbageType.label }}
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8"> 投放价格: </el-col>
                  <el-col :span="16">
                    {{ item.points }}
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onRuleDialogClose">取消</el-button>
        <el-button type="primary" @click="onRuleDialogConfirm"> 设置 </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 设置广告媒体-->
  <el-dialog title="广告媒体" v-model="mediumvisible" width="60%">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" type="card">
      <el-tab-pane label="待机" name="1">
        <el-table :data="awaitTableData" stripe style="width: 90%">
          <el-table-column label="媒体链接" width="180" v-slot="scope">
            <img
              :src="GetImageURL(scope.row.file_name)"
              class="image"
              v-if="scope.row.file_type == 1"
            />
            <Cvideo
              v-show="true"
              :videoUrl="GetVideoURL(scope.row.file_name)"
              :width="200"
              :height="200"
              :autoplay="false"
              :controls="true"
              :loop="false"
              :muted="false"
              preload="auto"
              :showPlay="true"
              :playWidth="96"
              zoom="cotain"
              v-if="scope.row.file_type == 2"
            />
          </el-table-column>
          <el-table-column label="类型" width="180" v-slot="scope">
            {{ ConvertMediumType(scope.row.file_type) }}
          </el-table-column>
          <el-table-column label="发布时间" v-slot="scope">
            {{ FormatDate(scope.row.create_time) }}
          </el-table-column>
          <el-table-column label="操作员" property="username" />
          <el-table-column label="操作" v-slot="scope">
            <el-link type="primary" @click="deleteMedium(scope.row)">删除</el-link>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="首页" name="2">
        <el-table :data="HomePageTableData" stripe style="width: 90%">
          <el-table-column label="媒体链接" width="180" v-slot="scope">
            <img
              :src="GetImageURL(scope.row.file_name)"
              class="image"
              v-if="scope.row.file_type == 1"
            />
            <Cvideo
              v-show="true"
              :videoUrl="GetVideoURL(scope.row.file_name)"
              :width="200"
              :height="200"
              :autoplay="false"
              :controls="true"
              :loop="false"
              :muted="false"
              preload="auto"
              :showPlay="true"
              :playWidth="96"
              zoom="cotain"
              v-if="scope.row.file_type == 2"
            />
          </el-table-column>
          <el-table-column label="类型" width="180" v-slot="scope">
            {{ ConvertMediumType(scope.row.file_type) }}
          </el-table-column>
          <el-table-column label="发布时间" v-slot="scope">
            {{ FormatDate(scope.row.create_time) }}
          </el-table-column>
          <el-table-column label="操作员" property="username" />
          <el-table-column label="操作" v-slot="scope">
            <el-link type="primary" @click="deleteMedium(scope.row)">删除</el-link>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="走字灯" name="3">
        <el-row v-for="item in ledContenData" :key="item" style="margin-top: 10px">
          <el-col :span="10">
            <el-input v-model="item.content" placeholder="请输入显示的内容" />
          </el-col>
          <el-col :span="8" style="padding-left: 20px">
            <el-button type="primary" @click="ledAddRecord">+</el-button>
            <el-button type="danger" v-if="item.id != 0" @click="delItem(item)">-</el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" @click="pushOne(item)">推送</el-button>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="12" />
          <el-col :span="12" style="padding-right: 156px; text-align: right">
            <el-button type="success" @click="pushBatch" v-if="false">一键推送</el-button>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

  <!-- 详情-->

  <el-dialog v-model="DetaildialogVisible" title="设备详细信息" width="90%">
    <MacDetail :row="currentDetailData" @do-rule="doEvent" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="DetaildialogVisible = false"> 关闭 </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 批量导入 -->
  <el-drawer
    v-model="showDrawer"
    title="批量导入"
    direction="rtl"
    :before-close="DrawerhandleClose"
  >
    <div class="drawerContent">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :action="GetUpLoadExcelURL()"
        multiple
        :limit="1"
        :headers="headObject"
        :on-remove="deleteFile"
        :on-success="handleAvatarSuccess"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text"> 拖放文件到这里 <em>或者点击这里来上传</em> </div>
        <template #tip>
          <div class="el-upload__tip"> 仅限 .xls 和 .xlsx 文件 </div>
        </template>
      </el-upload>
      <el-button type="primary" @click="doAddBatch">确定</el-button>
    </div>
  </el-drawer>

  <!-- 批量设置 走字灯-->
  <el-drawer
    v-model="showLedDrawer"
    title="批量设置走字灯"
    direction="rtl"
    :before-close="LedDrawerhandleClose"
  >
    <div class="ledMain">
      <el-form :model="BatcLedContent" label-width="120px">
        <el-form-item label="走字灯内容">
          <el-input v-model="BatcLedContent.content" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onBatchLed">一键推送</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
  <!--- 批量设置规则-->
  <el-dialog v-model="BatchRulesdialogVisible" title="批量设置规则" width="30%">
    <el-row>
      <el-form :model="BatcLedContent" label-width="120px">
        <el-form-item label="运营规则">
          <el-select v-model="batchRuleSelect" placeholder="请选择运营规则">
            <el-option v-for="item in rules" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="BatchRulesdialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doSetBatchRules"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 批量设置状态-->
  <el-drawer
    v-model="setBatchStatusVisiable"
    title="批量设置状态"
    direction="rtl"
    :before-close="statusDrawerHandleClose"
  >
    <div class="ledMain">
      <el-form :model="BatchStatusData" class="demo-form-inline">
        <el-form-item label="设备状态" label-width="100">
          <el-radio-group v-model="BatchStatusData.status" class="ml-4">
            <el-radio v-for="item in statusList" :label="item.id" :value="item.id" :key="item.id">{{
              item.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="运维人员" label-width="100">
          <el-select v-model="BatchStatusData.maintenanceStaff" placeholder="请选择运维人员">
            <el-option
              v-for="item in staffArray"
              :label="item.name"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="运营人员" label-width="100">
          <el-select v-model="BatchStatusData.operation" placeholder="请选择运营人员">
            <el-option
              v-for="item in staffArray"
              :label="item.name"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="LOGO" label-width="100">
          <el-upload
            class="avatar-uploader"
            :action="UpImageURL"
            :show-file-list="false"
            :on-success="BatchHandleUpdateSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="headObject"
          >
            <img
              v-if="BatchStatusData.pic"
              :src="getImageURL(BatchStatusData.pic)"
              class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="登录方式" label-width="100">
          <el-checkbox
            v-model="BatchStatusData.face"
            true-label="1"
            false-label="0"
            label="人脸认证"
            size="large"
          />
          <el-checkbox
            v-model="BatchStatusData.phone"
            true-label="1"
            false-label="0"
            label="手机认证"
            size="large"
          />
          <el-checkbox
            v-model="BatchStatusData.qcode"
            label="二维码认证"
            size="large"
            true-label="1"
            false-label="0"
          />
          <el-checkbox
            v-model="BatchStatusData.card"
            label="刷卡认证"
            size="large"
            true-label="1"
            false-label="0"
          />
        </el-form-item>

        <el-form-item label="登录方式" label-width="100">
          <el-select
            v-model="BatchStatusData.deviceArea"
            placeholder="请选择设备区域"
            ref="pointTpteSelectRef"
          >
            <el-option
              v-for="item in deviceAreaArray"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="doBatchSetStatus">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, Ref, onMounted, computed, inject } from 'vue'
import { ElSelect, ElMessage, ElMessageBox, TabsPaneContext, UploadInstance } from 'element-plus'
import { FormatDate, GetImageURL, GetVideoURL, GetUpLoadExcelURL } from '@/utils/tools'

import AMapLoader from '@amap/amap-jsapi-loader'
import { shallowRef } from 'vue'
import axios from 'axios'
import qs from 'qs'
import { Cvideo } from '@/views/video/components'
import { MacDetail } from './Components'

const reload: any = inject('reload')

const onPageRest = () => {
  reload()
}

//#region  设置广告媒体
let currentDeviceId = 0
let hp_page = ref(1)
let hp_size = ref(5)

const ConvertMediumType = (type: number): string => {
  let temp = '未知'
  switch (type) {
    case 1:
      temp = '图片'
      break
    case 2:
      temp = '视频'
      break
  }
  return temp
}

let awaitTableData: Ref<any[]> = ref([])
let HomePageTableData: Ref<any[]> = ref([])

let ledContenData: Ref<any[]> = ref([])

let mediumvisible = ref(false)
let activeName = ref('2')
const handleClick = (tab: TabsPaneContext) => {
  let pageSign = tab.paneName
  console.log(pageSign)
  switch (pageSign) {
    case '1':
      GetMediumOfAwait()
      break
    case '2':
      GetMediumOfHomePage()
      break
    case '3':
      GetLedContent()
      break
  }
}

const deleteMedium = (row: any) => {
  let param = {
    id: row.md_id
  }
  service.post(PATH_URL + '/MachineMange/deleteMedium', param).then((res: any) => {
    ElMessage(res.message)
    GetMediumOfHomePage()
    GetMediumOfAwait()
  })
}

//获取首页画面
const GetMediumOfHomePage = () => {
  let param = {
    deviceId: currentDeviceId,
    location: 1,
    page: hp_page.value,
    size: hp_size.value
  }

  service.post(PATH_URL + '/MachineMange/GetMedium', param).then((res: any) => {
    console.log('hp', res)
    HomePageTableData.value = res.data.records
  })
}

//获取待机画面
const GetMediumOfAwait = () => {
  let param = {
    deviceId: currentDeviceId,
    location: 2,
    page: hp_page.value,
    size: hp_size.value
  }

  service.post(PATH_URL + '/MachineMange/GetMedium', param).then((res: any) => {
    console.log('hp', res)
    awaitTableData.value = res.data.records
  })
}

const delItem = (row: any) => {
  let parm = {
    id: row.id
  }

  service.post(PATH_URL + '/MachineMange/DeleteDeviceLedContent', parm).then(() => {
    ElMessage('操作成功')
    GetLedContent()
  })
}

//获取走字灯数据
const GetLedContent = () => {
  let param = {
    deviceId: currentDeviceId
  }

  service.post(PATH_URL + '/MachineMange/getLedContent', param).then((res: any) => {
    let temp = res.data

    if (temp == undefined || temp.length == 0) {
      ledContenData.value = []
      ledAddRecord()
    } else {
      ledContenData.value = []
      temp.forEach((element, index) => {
        ledContenData.value.push({
          id: element.id,
          content: element.content,
          index: index
        })
      })
    }
  })
}

const ledAddRecord = () => {
  ledContenData.value.push({
    content: '',
    id: 0,
    index: ledContenData.value.length
  })
  console.log('sdsdsd', ledContenData.value)
}

const showMedium = (row: any) => {
  currentDeviceId = row.id
  GetMediumOfHomePage()
  mediumvisible.value = true
}

const pushOne = (row: any) => {
  console.log(row)
  let str: string = row.content.trim()
  if (str.trim().length == 0) {
    ElMessage('发送内容不能为空')
    return
  }

  let parm = {
    deviceId: currentDeviceId,
    content: row.content,
    id: row.id
  }

  service.post(PATH_URL + '/MachineMange/AddDeviceLedContent', parm).then(() => {
    ElMessage('推送成功')
  })
}

const pushBatch = () => {
  console.log(ledContenData)
}

//#endregion

const Permission = ref({
  add: 'mac_dvp_add',
  rev: 'mac_dvp_rev',
  del: 'mac_dvp_del',
  rul: 'mac_dvp_rul',
  reg: 'mac_dvp_reg',
  sec: 'mac_dvp_sec'
})

let getAddr = 'https://restapi.amap.com/v3/geocode/regeo'

//#region   数据结构

interface SearchDataStruct {
  deviceNumber: string
  deviceName: string
  deviceArea: number | null
  deviceType: number | null
  departmentId: number | null
  deviceStatus: number | null
  deviceOnLine: number | null
  deviceAtivation: number | null
  IMEI: string | null
}

interface DeviceAreaStruct {
  id: number
  areaName: string
}

interface DeviceTypeStrcut {
  id: number
  name: string
}

interface DepartmentStruct {
  id: number
  platform_name: string
}

interface DeviceStatusStruct {
  id: number
  label: string
}

interface StaffStruct {
  id: number
  name: string
}

interface RuleDataStruct {
  id: number
  label: string
}
const Activation = [
  {
    value: 0,
    label: '未激活'
  },
  {
    value: 1,
    label: '激活'
  }
]

const OnLineOption = [
  {
    value: 0,
    label: '离线'
  },
  {
    value: 1,
    label: '在线'
  }
]

//#endregion

//当前校准地图的设备id
const statusList = [
  {
    label: '待使用',
    id: '1'
  },
  {
    label: '使用中',
    id: '2'
  },
  {
    label: '已禁用',
    id: '3'
  },
  {
    label: '故障',
    id: '4'
  },
  {
    label: '已欠费',
    id: '5'
  }
]

let idOfCorrent = 0

const onCorrect = (val) => {
  idOfCorrent = val.id
  markerAddr.value = ''
  MapdialogVisible.value = true

  console.log('initMap', val.lat, val.lng)
  initMap(val.lat, val.lng)
}

const ConvertCorrect = (val) => {
  if (val === 0) {
    return '未校准'
  } else {
    return '已校准'
  }
}

const ConverStatus = (val) => {
  let temp = ''
  switch (val) {
    case 1:
      temp = '待使用'
      break
    case 2:
      temp = '使用中'
      break
    case 3:
      temp = '已禁用'
      break
    case 4:
      temp = '故障'
      break
    case 5:
      temp = '已欠费'
      break
    default:
      temp = '未知'
      break
  }

  return temp
}

const map = shallowRef(null)
let currentPage = ref(1)
let pageSize = ref(5)
let small = ref(false)
let disabled = ref(false)
let total = ref(0)
let marker: any
let markerAddr = ref('')
let _AMap: any
const handleSizeChange = () => {
  getDeviceData()
}

const initMap = (lat: number, lng: number) => {
  if (lat == null || lng == null) {
    lat = 30.572269
    lng = 104.066541
  }

  AMapLoader.load({
    key: '1fbe431a5c04fd4df2364411a8c8415b',
    version: '2.0',
    plugins: ['AMap.ToolBar', 'AMap.Driving']
  })
    .then((AMap) => {
      _AMap = AMap
      map.value = new AMap.Map('container', {
        viewMode: '3D',
        zoom: 10,
        zooms: [2, 22],
        center: [lng, lat]
      })

      marker = new AMap.Marker({
        position: new AMap.LngLat(lng, lat),
        title: '自定义',
        draggable: true
      })
      ;(map.value as any).add(marker)
      marker.on('dragend', () => {
        console.log(marker.getPosition())
        getMapAddress()
      })
      getMapAddress()
    })
    .catch((e) => {
      console.log(e)
    })
}

const getMapAddress = () => {
  let url =
    getAddr +
    '?key=2ad12f130081a5e44748c8bd3da23d07&location=' +
    marker.getPosition().lng +
    ',' +
    marker.getPosition().lat
  axios.get(url).then((res) => {
    markerAddr.value = res.data.regeocode.formatted_address
  })
}

const doAddressToCoordinate = () => {
  addressToCoordinate(markerAddr.value)
}

const addressToCoordinate = (addr: string) => {
  let url =
    'https://restapi.amap.com/v3/geocode/geo' +
    '?key=2ad12f130081a5e44748c8bd3da23d07&address=' +
    addr

  axios.get(url).then((res: any) => {
    console.log('addrss', res.data.geocodes[0].location)
    if (map.value != null) {
      let temp = res.data.geocodes[0].location.split(',')
      let lng = temp[0]
      let lat = temp[1]
      ;(map.value as any).setCenter([lng, lat])
      console.log(marker)
      let ponsiton = new _AMap.LngLat(lng, lat)
      if (marker == undefined) {
        marker = new _AMap.Marker({
          ponsiton: ponsiton,
          draggable: true,
          title: '自定义'
        })
        marker.on('dragend', () => {
          getMapAddress()
        })
        ;(map.value as any).add(marker)
      } else {
        marker.setPosition(ponsiton)
      }
      marker.setPosition([lng, lat])
    }
  })
}

//#region  初始化
onMounted(() => {
  getDeviceData()
  getDevcieType()
  getDeviceStatus()
  getDepartment()
  getDeviceArea()
  getStaff()
  getRules()
})

//设备区域
let deviceAreaArray: Ref<DeviceAreaStruct[]> = ref([])

let deviceTypeArray: Ref<DeviceTypeStrcut[]> = ref([])

let departmentArray: Ref<DepartmentStruct[]> = ref([])

let deviceStatusArray: Ref<DeviceStatusStruct[]> = ref([])

let staffArray: Ref<StaffStruct[]> = ref([])

let showSearchForm = ref(true)

let SearchFormData: Ref<SearchDataStruct> = ref({
  deviceNumber: '',
  deviceName: '',
  deviceArea: null,
  deviceType: null,
  departmentId: null,
  deviceStatus: null,
  deviceOnLine: null,
  deviceAtivation: null,
  IMEI: null
})

const getDeviceData = () => {
  let parm = {
    id: SearchFormData.value.deviceNumber,
    deviceName: SearchFormData.value.deviceName,
    deviceArea: SearchFormData.value.deviceArea,
    deviceType: SearchFormData.value.deviceType,
    departmentId: SearchFormData.value.departmentId,
    status: SearchFormData.value.deviceStatus,
    onLine: SearchFormData.value.deviceOnLine,
    activation: SearchFormData.value.deviceAtivation,
    page: currentPage.value,
    size: pageSize.value,
    imei: SearchFormData.value.IMEI
  }

  service.post(PATH_URL + '/MachineMange/getDevice', parm).then((res) => {
    //  console.log('device', res)
    TableData.value = res.data.records
    total.value = res.data.total
  })
}

const onSearch = () => {
  getDeviceData()
}

const onReset = () => {
  SearchFormData.value.deviceNumber = ''
  SearchFormData.value.deviceName = ''
  SearchFormData.value.deviceArea = null
  SearchFormData.value.deviceType = null
  SearchFormData.value.departmentId = null
  SearchFormData.value.deviceStatus = null
  SearchFormData.value.deviceOnLine = null
  SearchFormData.value.deviceAtivation = null
  SearchFormData.value.IMEI = null
}

const getStaff = () => {
  service.get(PATH_URL + '/Permission/getUsableStaff').then((res) => {
    console.log('staff', res)
    staffArray.value = res.data
  })
}

const getDevcieType = () => {
  service.post(PATH_URL + '/MachineMange/getDeviceType').then((res) => {
    deviceTypeArray.value = res.data
  })
}

const getDeviceStatus = () => {
  service.get(PATH_URL + '/MachineMange/getDeviceStatus').then((res) => {
    deviceStatusArray.value = res.data
  })
}

const getDepartment = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res) => {
    departmentArray.value = res.data
  })
}
const getDeviceArea = () => {
  service.post(PATH_URL + '/Permission/getDeviceArea').then((res) => {
    deviceAreaArray.value = res.data
  })
}
//#endregion

//#region  新增按钮
let disableUpdate = ref(true)
let disableRemove = ref(true)
const OnClickAdd = () => {
  isUpdate = false
  dialogTitle.value = '添加设备'
  initAddDeviceData()
  dialogTableVisible.value = true
}

const initAddDeviceData = () => {
  AddDataForm.value.deviceType = undefined
  AddDataForm.value.SerialNumber = ''
  AddDataForm.value.name = ''
  AddDataForm.value.pic = ''
  AddDataForm.value.face = false
  AddDataForm.value.phone = false
  AddDataForm.value.qcode = false
  AddDataForm.value.card = false
  AddDataForm.value.deviceArea = undefined
  AddDataForm.value.mStaff = undefined
  AddDataForm.value.wStaff = undefined
  AddDataForm.value.status = '1'
  AddDataForm.value.sNumber = ''
}

const deleteOfDetail = () => {
  ElMessageBox.confirm('确定要删除这些设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    service
      .post(
        PATH_URL + '/MachineMange/deleteDevice',
        qs.stringify(
          {
            ids: DeleteIdArray
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceData()
      })
  })
}

const OnClickOfShowForm = () => {
  showSearchForm.value = !showSearchForm.value
}

//#endregion

//#region 表格相关
let TableData = ref([])
let DeleteIdArray: number[] = []
const handleSelectionChange = (val) => {
  if (val.length > 0) {
    disableRemove.value = false
    disableLed.value = false
    setBatchStatusDisable.value = false
    disableUpdate.value = false
  } else {
    disableRemove.value = true
    disableLed.value = true
    setBatchStatusDisable.value = true
    disableUpdate.value = true
  }

  DeleteIdArray = []
  val.forEach((row) => {
    DeleteIdArray.push(row.id)
  })
}

const handleDetail = (val) => {
  console.log(val)
  initAddDeviceData()
  isUpdate = true
  AddDataForm.value.deviceType = val.deviceType?.id
  AddDataForm.value.SerialNumber = val.serialNumber
  AddDataForm.value.name = val.name
  AddDataForm.value.pic = val.pic
  AddDataForm.value.face = val.face == 1 ? true : false
  AddDataForm.value.card = val.card == 1 ? true : false
  AddDataForm.value.phone = val.phone == 1 ? true : false
  AddDataForm.value.qcode = val.qrcode == 1 ? true : false
  AddDataForm.value.status = val.status + ''
  AddDataForm.value.deviceArea = val.area?.id
  AddDataForm.value.mStaff = val.maintenanceStaff
  AddDataForm.value.wStaff = val.operators
  AddDataForm.value.id = val.id
  AddDataForm.value.userSerial = val.userSerial
  dialogTableVisible.value = true
}

const handleRemove = (val) => {
  ElMessageBox.confirm('确定要删除这台设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let ids = []
    ids.push(val.id as never)

    service
      .post(
        PATH_URL + '/MachineMange/deleteDevice',
        qs.stringify(
          {
            ids: ids
          },
          { arrayFormat: 'brackets' }
        )
      )
      .then(() => {
        ElMessage('操作成功')
        getDeviceData()
      })
  })
}

//#endregion

//#region  添加 dialog
let isUpdate = false
// let prefix: Ref<string> = ref('00000')

let dialogTitle = ref('')

let dialogTableVisible = ref(false)
let AddDataForm = ref({
  deviceType: undefined,
  SerialNumber: '',
  name: '',
  pic: '',
  face: false,
  phone: false,
  qcode: false,
  card: false,
  deviceArea: undefined,
  mStaff: undefined,
  wStaff: undefined,
  status: '1',
  sNumber: '',
  id: 0,
  userSerial: ''
})

const onCloseDialog = () => {
  dialogTableVisible.value = false
}

// 上传图片地址
const UpImageURL = computed(() => {
  return PATH_URL + '/Common/upLoadImage'
})

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})

const handleUpdateSuccess = (respon) => {
  if (respon.code == 200) {
    AddDataForm.value.pic = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}
const beforeAvatarUpload = () => {}

const onAddConfirm = () => {
  if (isUpdate) {
    updateDevice()
    return
  }
  ElMessageBox.confirm('你确认添加这台设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    AddDataForm.value.sNumber = AddDataForm.value.SerialNumber
    service.post(PATH_URL + '/MachineMange/addDevice', AddDataForm.value).then((res: any) => {
      ElMessage(res.message)
      getDeviceData()
      onCloseDialog()
    })
  })
}

const updateDevice = () => {
  ElMessageBox.confirm('你确认修改这台设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    AddDataForm.value.sNumber = AddDataForm.value.SerialNumber
    service.post(PATH_URL + '/MachineMange/updateDevice', AddDataForm.value).then(() => {
      ElMessage('操作成功')
      getDeviceData()
      onCloseDialog()
    })
  })
}

const onCloseMapDialog = () => {
  MapdialogVisible.value = false
  idOfCorrent = 0
  markerAddr.value = ''
}

const DoCorrect = () => {
  ElMessageBox.confirm('你确认校准这台设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let param = {
      id: idOfCorrent,
      lat: marker.getPosition().lat,
      lng: marker.getPosition().lng,
      addr: markerAddr.value
    }

    service.post(PATH_URL + '/MachineMange/CalibrationAddressOfDevice', param).then(() => {
      ElMessage('操作成功')
      getDeviceData()
      onCloseMapDialog()
    })
  })
}

//#endregion

let MapdialogVisible = ref(false)
let ruleData: any = ref({})
//#region 地图dialog

//#endregion
let ruleDialogVisible = ref(false)

let RuleArray: Ref<RuleDataStruct[]> = ref([])

const setRule = (val) => {
  console.log(val)
  ruleData.value.DeviceId = val.id
  let param = {
    deviceTypeId: val.deviceType.id
  }
  service.post(PATH_URL + '/MachineMange/getWorkableDeviceRule', param).then((res) => {
    RuleArray.value = res.data
    if (RuleArray.value.length > 0) {
      if (val.ruleId == null || val.ruleId == '' || val.ruleId == undefined) {
        ruleData.value.ruleId = (RuleArray.value[0] as any).id
      } else {
        ruleData.value.ruleId = val.ruleId
      }
      onRuleSelect(ruleData.value.ruleId)
    }
    ruleDialogVisible.value = true
  })
}
let warehouseRef: Ref<any[]> = ref([])
const onRuleSelect = (val) => {
  RuleArray.value.forEach((item) => {
    if (item.id == val) {
      warehouseRef.value = (item as any).warehouse
    }
  })
}

const onRuleDialogClose = () => {
  ruleDialogVisible.value = false
}

const onRuleDialogConfirm = () => {
  console.log('ruleData', ruleData)
  ElMessageBox.confirm('你确认要修改这台设备的运营规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let parm = {
      deviceId: ruleData.value.DeviceId,
      ruleId: ruleData.value.ruleId
    }
    console.log('parm', parm)
    service.post(PATH_URL + '/MachineMange/setRule', parm).then(() => {
      ElMessage('操作成功')
      getDeviceData()
      onRuleDialogClose()
    })
  })
}

const setNoWork = (val) => {
  console.log(val)

  ElMessageBox.confirm('你确认要把这台设备设置为未激活吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let parm = {
      deviceId: val.id
    }
    console.log('parm', parm)
    service.post(PATH_URL + '/MachineMange/setDeviceNoWork', parm).then(() => {
      ElMessage('操作成功')
      getDeviceData()
    })
  })
}

//const router = useRouter()

const toDetail = (row: any) => {
  console.log(row)
  currentDetailData.value = row
  DetaildialogVisible.value = true
}

// const upgrade = (row: any) => {
//   let param = {
//     deviceId: row.id
//   }
//   service.post(PATH_URL + '/MachineMange/test', param).then(() => {
//     ElMessage('消息已推送')
//   })
// }

//#region  设备详情相关

let DetaildialogVisible = ref(false)
let currentDetailData: Ref<any> = ref({})

//#endregion

const doEvent = () => {
  setRule(currentDetailData.value)
}

//#region 批量添加相关

const addBatch = () => {
  console.log('url', GetUpLoadExcelURL())
  showDrawer.value = true
}

const DrawerhandleClose = () => {
  showDrawer.value = false
}

let showDrawer = ref(false)
const doAddBatch = () => {
  service.get(PATH_URL + '/MachineMange/addDeviceBatch?fileName=' + fileName).then(() => {
    getDeviceData()
    showDrawer.value = false
    uploadRef.value!.clearFiles()
    ElMessage('导入成功')
  })
}

const headObject = {
  Authorization: localStorage.getItem('token')
}

const deleteFile = (file) => {
  service.get(PATH_URL + '/Common/deleteHardwarePackage?fileName=' + file.name).then((res: any) => {
    console.log(res)
  })
}

let fileName: string | undefined = ''
const uploadRef = ref<UploadInstance>()
const handleAvatarSuccess = (res: any) => {
  if (res.data == undefined) {
    ElMessage(res.message)
    uploadRef.value!.clearFiles()
    fileName = undefined
  } else {
    fileName = res.data
  }
}

//#endregion

//#region 批量设置走字灯
let disableLed = ref(true)
let showLedDrawer = ref(false)
const setLedBatch = () => {
  BatcLedContent.value.content = ''
  showLedDrawer.value = true
}

const LedDrawerhandleClose = () => {
  showLedDrawer.value = false
}

//#endregion

//#region 批量设置状态
let BatchStatusData: Ref<any> = ref({})
let setBatchStatusVisiable = ref(false)
let setBatchStatusDisable = ref(true)
const setStatusBatch = () => {
  setBatchStatusVisiable.value = true
  BatchStatusData.value = {}
}

const statusDrawerHandleClose = () => {
  setBatchStatusVisiable.value = false
}

const doBatchSetStatus = () => {
  let param = {
    ids: DeleteIdArray,
    param: BatchStatusData.value
  }

  service.post(PATH_URL + '/MachineMange/SetStatusWithBatch', param).then(() => {
    ElMessage('操作成功')
    getDeviceData()
    setBatchStatusVisiable.value = false
  })
}

const BatchHandleUpdateSuccess = (respon) => {
  console.log('res', respon)
  if (respon.code == 200) {
    BatchStatusData.value.pic = respon.data
  } else {
    ElMessage('上传图片出错了')
  }
}

//#endregion

//#region 批量设置走字灯
let BatcLedContent: Ref<any> = ref({})
const onBatchLed = () => {
  let param = {
    ids: DeleteIdArray,
    content: BatcLedContent.value.content
  }

  service.post(PATH_URL + '/MachineMange/setLedContent', param).then(() => {
    ElMessage('操作成功')
    showLedDrawer.value = false
  })
}

const onClickExport = () => {
  let parm = {
    id: SearchFormData.value.deviceNumber,
    deviceName: SearchFormData.value.deviceName,
    deviceArea: SearchFormData.value.deviceArea,
    deviceType: SearchFormData.value.deviceType,
    departmentId: SearchFormData.value.departmentId,
    status: SearchFormData.value.deviceStatus,
    page: currentPage.value,
    size: pageSize.value
  }
  axios({
    method: 'post',
    url: PATH_URL + '/MachineMange/exportExcelForMacDevice',
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    data: parm
  }).then((response) => {
    var blob = new Blob([response.data], { type: 'application/vnd.ms-excel' }) //根据实际情况设置type
    var link = document.createElement('a')
    var body = document.querySelector('body')

    link.href = window.URL.createObjectURL(blob)
    link.download = '导出设备列表.xls'

    // fix Firefox
    link.style.display = 'none'
    body?.appendChild(link)

    link.click()
    body?.removeChild(link)

    window.URL.revokeObjectURL(link.href)
  })

  // service.post(PATH_URL + '/MachineMange/exportExcelForMacDevice', parm).then(() => {})
}

let BatchRulesdialogVisible = ref(false)
const doSetRuleBatch = () => {
  BatchRulesdialogVisible.value = true
}
let batchRuleSelect: Ref<any> = ref()

let rules: Ref<any[]> = ref([])

const getRules = () => {
  service.get(PATH_URL + '/MachineMange/getRulesForDepartment').then((res: any) => {
    rules.value = res.data
  })
}

const doSetBatchRules = () => {
  let param = {
    ids: DeleteIdArray,
    rules: batchRuleSelect.value
  }

  service.post(PATH_URL + '/MachineMange/setBatchRules', param).then((res: any) => {
    console.log(res)
    ElMessage('操作成功')
    BatchRulesdialogVisible.value = false
    getDeviceData()
  })
}

const doSetNotActive = () => {
  service
    .post(
      PATH_URL + '/MachineMange/setNotActiveBatch',
      qs.stringify(
        {
          ids: DeleteIdArray
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then(() => {
      ElMessage('操作成功')
      getDeviceData()
    })
}

//#endregion
</script>

<style lang="less" scoped>
// .addressInput /deep/ .el-input_inner {
//   border: none;
// }

.frame {
  .el-form-item {
    height: 30px;
    line-height: 30px;

    .el-input {
      width: 150px;
    }

    .el-select {
      width: 150px;
    }
  }
}

.buttonOfTables {
  .el-link {
    margin-left: 10px;
  }
}

.scrollbar-demo-item {
  display: flex;
  width: 100%;
  height: 150px;
  margin: 15px;
  color: var(--el-color-primary);
  text-align: center;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  align-items: center;
  justify-content: center;

  .img {
    width: 160px;
    height: 160px;
    background-color: aquamarine;
  }
}

.avatar-uploader .avatar {
  display: block;
  width: 120px;
  height: 120px;
}
</style>

<style>
.avatar-uploader .el-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}

.map {
  width: 100%;
  height: 400px;
}
</style>
