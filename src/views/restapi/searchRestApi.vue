<template>
  <div class="app-container">
    <iframe id="myIframe" :src="searchSwaggerUrl" width="100%" height="750px;"/>
  </div>
</template>

<script>

import { Loading } from 'element-ui'

export default {

  data() {
    return {
      searchSwaggerUrl: process.env.Search_API + '/swagger-ui/index.html'
    }
  },
  mounted() {
    const iframe = document.getElementById('myIframe')
    const uploadLoading = Loading.service({
      lock: true,
      text: '正在努力加载中……'
    })
    if (iframe.attachEvent) {
      iframe.attachEvent('onload', function() {
        uploadLoading.close()
      })
    } else {
      iframe.onload = function() {
        uploadLoading.close()
      }
    }
  },
  created() {

  },
  methods: {

  }
}
</script>

