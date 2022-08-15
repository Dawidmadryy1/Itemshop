<template>
  <div>
    <v-card class="pt-1">
      <v-card-title class="headline">
        <span class="text-h5">{{ $t('titles.adding_vouchers') }}</span>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="service"
                item-text="name"
                item-value="value"
                :label="$t('fields.choose_service')"
                :hint="$t('fields.choose_service_hint')"
                persistent-hint
                :items="services"
                :rules="rules.service"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="amount"
                :label="$t('fields.codes_amount')"
                :hint="$t('fields.codes_amount_hint')"
                persistent-hint
                type="number"
                :rules="rules.amount"
                max="100"
                min="0"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                :return-value.sync="date"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="date"
                    :label="$t('fields.voucher_deadline')"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>
                <v-date-picker
                  v-model="date"
                  light
                  color="primary"
                  range
                  no-title
                  scrollable
                  :rules="rules.date"
                >
                  <v-spacer />
                  <v-btn
                    text
                    color="primary"
                    @click="menu = false"
                  >
                    {{ $t('actions.cancel') }}
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.menu.save(date)"
                  >
                    {{ $t('actions.save') }}
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="accent"
          @click="create"
        >
          {{ $t('actions.create') }}
        </v-btn>
        <v-btn
          color="primary"
          @click="createAndDownload"
        >
          {{ $t('actions.create_and_download') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="pt-1 mt-5">
      <v-card-title>
        {{ $t("titles.vouchers") }}
        <v-btn v-if="selected.length>0" class="ml-3" color="error" @click="del">
          {{ $t("actions.remove_selected") }}
        </v-btn>
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
        v-model="selected"
        item-key="code"
        :headers="headers"
        :items="vouchersList"
        :search="search"
        show-select
      />
    </v-card>
  </div>
</template>
<script>
export default {
  name: 'ShopVouchers',
  props: {
    shop: {
      type: Object,
      required: true
    },
    servers: {
      type: Object,
      required: true
    },
    vouchers: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      selected: [],
      headers: [
        { text: 'Kod', value: 'code' },
        { text: 'Stworzony', value: 'start' },
        { text: 'Wygasa', value: 'end' },
        { text: 'Nazwa usługi', value: 'service' },
        { text: 'Transakcja', value: 'transaction' }
      ],
      search: '',
      valid: false,
      date: [(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)],
      menu: false,
      service: '',
      amount: 0,
      rules: {
        service: [
          v => this.$regex.not_empty(v) || this.$t('formats.field_not_empty')
        ],
        amount: [
          v => this.$regex.not_empty(v) || this.$t('formats.field_not_empty'),
          v => this.$regex.is_natural_number(v) || this.$t('formats.wrong_codes_number'),
          v => this.$regex.max_100(v) || this.$t('formats.max_100_vouchers')
        ],
        date: [
          v => this.$regex.not_empty(v) || this.$t('formats.field_not_empty')
        ]
      }
    }
  },
  head () {
    return {
      title: this.$t('titles.vouchers')
    }
  },
  computed: {
    services () {
      const result = []
      for (const serviceId in this.shop.services) {
        const service = this.shop.services[serviceId]
        const server = this.servers[service.server] ? this.servers[service.server].serverName : ''
        result.push({
          name: `${service.name} (${server})`,
          value: serviceId
        })
      }
      return result
    },
    vouchersList () {
      const result = []
      for (const i in this.vouchers) {
        result.push({
          code: i,
          service: this.shop.services[this.vouchers[i].service].name,
          start: this.vouchers[i].start,
          end: this.vouchers[i].end ? this.vouchers[i].end : this.vouchers[i].start,
          transaction: this.vouchers[i].transaction ? this.vouchers[i].transaction : 'Niewykorzystany'
        })
      }
      return result
    }
  },
  methods: {
    download (text, filename) {
      const blob = new Blob([text], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
    },
    del () {
      for (const i in this.selected) {
        this.$fire.database.ref().child(`vouchers/${this.$route.params.shopid}/${this.selected[i].code}`).remove()
      }
      this.selected = []
    },
    createAndDownload () {
      this.$refs.form.validate()
      if (this.valid) {
        const { date, service, amount } = this
        const codes = []
        const voucher = {
          service,
          start: date[0]
        }
        if (date[1]) {
          voucher.end = date[1]
        }
        for (let i = 0; i < amount; i++) {
          const code = Math.random().toString(36).replace('0.', '')
          codes.push(code)
          this.$fire.database.ref().child(`vouchers/${this.$route.params.shopid}/${code}`).set(voucher)
        }
        const result = codes.join('\n')
        this.download(result, `vouchers-${service}.txt`)
        this.amount = 0
        this.service = ''
      }
    },
    create () {
      this.$refs.form.validate()
      if (this.valid) {
        const { date, service, amount } = this
        const voucher = {
          service,
          start: date[0]
        }
        if (date[1]) {
          voucher.end = date[1]
        }
        for (let i = 0; i < amount; i++) {
          const code = Math.random().toString(36).replace('0.', '')
          this.$fire.database.ref().child(`vouchers/${this.$route.params.shopid}/${code}`).set(voucher)
        }
        this.amount = 0
        this.service = ''
      }
    }
  }
}
</script>
