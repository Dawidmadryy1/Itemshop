import {google} from 'googleapis'
import fs from 'fs'
import fetch from 'node-fetch'

async function getToken (serviceAccount) {
  var scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/firebase'
  ]
  var jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes)
  return jwtClient.authorize().then((tokens) => tokens.access_token)
}

async function enableEmailProvider (projectId, token) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired&alt=json`, {
    method: 'PATCH',
    body: JSON.stringify({
      'signIn': {
        'email': {
          'enabled': true,
          'passwordRequired': true
        }
      }
    }),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  console.log(await res.text())
}

async function getDefaultWebAppConfig (projectId, token) {
  let webApps = await (await fetch(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })).json()
  if (webApps.apps) {
    console.log('Web app found')
    return await (await fetch(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${webApps.apps[0].appId}/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })).json()
  } else {
    console.log('No web app found, creating one...')
    await fetch(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        displayName: 'ItemSzop'
      })
    })
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 5000)
    })
    return await getDefaultWebAppConfig(projectId, token)
  }
}

async function updateFirebaseRules (databaseURL, token, rules) {
  const json = await (await fetch(`${databaseURL}/.settings/rules.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: rules
  })).json()
  if (json.status === 'ok') {
    console.log('Firebase rules updated')
  } else {
    console.error('Could not update firebase rules')
  }
}

async function enableFirebaseDatabase (projectId, token) {
  const res = await fetch(`https://firebase.googleapis.com/v1beta1/projects/${projectId}:addFirebase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    })
  })
  console.log(await res.text())
  console.log("Firebase database enabled")
}

export default async function () {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG)
    const token = await getToken(serviceAccount)
    await enableEmailProvider(serviceAccount.project_id, token)
    await enableFirebaseDatabase(serviceAccount.project_id, token)
    const config = await getDefaultWebAppConfig(serviceAccount.project_id, token)
    let rules
	  if (process.env.OWNER_ID) {
	    rules = fs.readFileSync('./rules/one_owner_firebase.rules.json', 'utf-8').replace(/OWNER_ID/g, process.env.OWNER_ID)
	  } else {
	    rules = fs.readFileSync('./rules/firebase.rules.json', 'utf-8')
	  }
    console.log(config)
    await updateFirebaseRules(config.databaseURL, token, rules)
    this.options.firebase = {config}
    console.log(this.options.firebase)
  } catch (e) {
    console.error('The keys are misconfigured in the FIREBASE_CONFIG environment variable')
    process.exit()
  }
}
