<template>
  <v-container>
    <v-textarea
      v-model="sak"
      label="Zawartość pliku serviceAccountKey.json"
    />
    <v-alert v-if="error" class="error">
      Niepoprawny format!
    </v-alert>
    <template v-if="!error && !!sak">
      <v-alert class="success">
        Prawidłowy format!
      </v-alert>
      <v-btn class="primary" @click="copyToClipboard()">
        Skopiuj klucz FIREBASE_CONFIG do schowka
      </v-btn>
    </template>
  </v-container>
</template>
<script>
export default {
  name: 'SakGen',
  data: () => {
    return {
      sak: '',
      error: false
    }
  },
  watch: {
    sak () {
      try {
        const json = JSON.parse(this.sak)
        console.log(json)
        this.error = false
      } catch (e) {
        this.error = true
      }
    }
  },
  methods: {
    copyToClipboard () {
      const text = this.sak.replace(/\n/, '')

      if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData('Text', text)
      } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        const textarea = document.createElement('textarea')
        textarea.textContent = text
        textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea)
        textarea.select()
        try {
          return document.execCommand('copy') // Security exception may be thrown by some browsers.
        } catch (ex) {
          console.warn('Copy to clipboard failed.', ex)
          return prompt('Copy to clipboard: Ctrl+C, Enter', text)
        } finally {
          document.body.removeChild(textarea)
        }
      }
    }
  }
}
</script>
