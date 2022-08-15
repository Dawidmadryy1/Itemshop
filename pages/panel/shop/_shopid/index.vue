<template>
  <div>
    <h1 class="display-1 mt-3 mb-5">
      {{ shop.name }}
    </h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-alert
          v-if="url"
          dark
          color="accent"
          elevation="2"
        >
          {{ $t('misc.shop_url') }} <a :href="url" target="_blank">{{ url }}</a>
        </v-alert>
      </v-col>
    </v-row>
    <v-card class="pt-1 mt-5">
      <v-card-title>
        {{ $t("titles.transactions") }}
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          :label="$t('fields.search')"
          single-line
          hide-details
        />
      </v-card-title>
      <v-data-table
        item-key="code"
        :headers="headers"
        :items="transactions"
        :search="search"
        :custom-sort="customSort"
        :sort-by="'date'"
        :sort-desc="false"
      />
    </v-card>
  </div>
</template>
<script>

export default {
  name: 'ShopIndex',
  props: {
    shop: {
      type: Object,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      search: '',
      headers: [
        { text: 'Id', value: 'id' },
        { text: 'Kupujący', value: 'nick' },
        { text: 'Brama', value: 'type' },
        { text: 'Wykonanie', value: 'date' }
      ]
    }
  },
  head () {
    return {
      title: this.$t('titles.dashboard')
    }
  },
  computed: {
    transactions () {
      const result = []
      for (const i in this.shop.history) {
        const date = new Date(this.shop.history[i].date).toLocaleString('pl-PL')
        result.push({
          id: i,
          nick: this.shop.history[i].nick,
          type: this.shop.history[i].type,
          date
        })
      }
      return result
    }
  },
  methods: {
    localeStringToNumber (str) {
      let [p1, p2] = str.split(', ')
      p1 = p1.split('.')
      p2 = p2.split(':')
      return (new Date(parseInt(p1[2]), parseInt(p1[1]), parseInt(p1[0]), parseInt(p2[0]), parseInt(p2[1]), parseInt(p2[2]))).getTime()
    },
    customSort (items, index, isDesc) {
      items.sort((a, b) => {
        if (index[0] === 'date') {
          if (!isDesc[0]) {
            return this.localeStringToNumber(b[index]) - this.localeStringToNumber(a[index])
          } else {
            return this.localeStringToNumber(a[index]) - this.localeStringToNumber(b[index])
          }
        } else if (isDesc[0]) {
          if (a[index] > b[index]) {
            return -1
          } else if (a[index] < b[index]) {
            return 1
          } else {
            return 0
          }
        } else if (a[index] < b[index]) {
          return -1
        } else if (a[index] > b[index]) {
          return 1
        } else {
          return 0
        }
      })
      return items
    }
  }
}
</script>
