import { Alert } from 'react-native';

export const FETCH_ERROR = 2
export const POST_ERROR = 3
export const FETCH_OK = 4
export const POST_OK = 5
export const NO_AUTH = 6
export const DELETE_ERROR = 7

class MicroPubApi {

  async get_config(service) {
    console.log('MicroPubApi:get_config', service.username);
    try {
      const response = await fetch(`${service.endpoint}?q=config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${service.token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.log(error)
      return FETCH_ERROR
    }
  }

  async send_post(service, content, title = null, categories = [], status = null, syndicate_to = null) {
    console.log('MicroPubApi:send_post', service, content, title, status, syndicate_to);

    const params = new FormData()
    params.append('h', 'entry')
    params.append('content', content)
    if (title) {
      params.append('name', title)
    }
    if (status) {
      params.append('post-status', status)
    }
    if (categories.length) {
      categories.forEach(category => {
        params.append('category[]', category)
      })
    }
    params.append('mp-destination', service.destination)
    if (syndicate_to != null && syndicate_to.length > 0) {
      syndicate_to.forEach(syndicate => {
        params.append('mp-syndicate-to[]', syndicate)
      })
    }
    else if (syndicate_to != null && syndicate_to.length === 0) {
      params.append('mp-syndicate-to[]', "")
    }

    console.log("MicroPubApi:send_post:FORM_DATA:PARAMS", params)

    try {
      const response = await fetch(service.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${service.token}`
        },
        body: params
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error_description) {
          Alert.alert(
            "Something went wrong.",
            errorData.error_description
          )
        } else {
          Alert.alert(
            "Something went wrong.",
            "Please try again later."
          )
        }
        return POST_ERROR
      }

      return true
    } catch (error) {
      console.log(error)
      Alert.alert(
        "Something went wrong.",
        "Please try again later."
      )
      return POST_ERROR
    }
  }

  async get_categories(service, destination = null) {
    console.log('MicroPubApi:get_categories');
    try {
      const params = new URLSearchParams({
        q: 'category',
        'mp-destination': destination
      })
      const response = await fetch(`${service.endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${service.token}`,
          'Content-Type': 'application/json'
        }
      })
      return await response.json()
    } catch (error) {
      console.log(error)
      return FETCH_ERROR
    }
  }

  async get_syndicate_to(service, destination = null) {
    console.log('MicroPubApi:get_syndicate_to');
    try {
      const params = new URLSearchParams({
        q: 'syndicate-to',
        'mp-destination': destination
      })
      const response = await fetch(`${service.endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${service.token}`,
          'Content-Type': 'application/json'
        }
      })
      return await response.json()
    } catch (error) {
      console.log(error)
      return FETCH_ERROR
    }
  }

  async send_entry(service, entry, entry_type) {
    console.log('MicroPubApi:send_entry', service, entry, entry_type);
    
    const params = new FormData()
    params.append('h', 'entry')
    params.append(entry_type, entry)
    params.append('mp-destination', service.destination)
    
    console.log("MicroPubApi:send_entry:FORM_DATA:PARAMS", params)

    try {
      const response = await fetch(service.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${service.token}`
        },
        body: params
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error_description) {
          Alert.alert(
            "Something went wrong.",
            errorData.error_description
          )
        } else {
          Alert.alert(
            "Something went wrong.",
            "Please try again later."
          )
        }
        return POST_ERROR
      }

      return true
    } catch (error) {
      console.log(error)
      Alert.alert(
        "Something went wrong.",
        "Please try again later."
      )
      return POST_ERROR
    }
  }

  async post_update(service, content, url, title, categories) {
    console.log('MicroPubApi:post_update', content, url, title, categories);

    const params = {
      "action": "update",
      "url": url,
      "mp-destination": service.destination,
      "replace": {
        "content": [content],
        "name": [title],
        "category": categories
      }
    }

    console.log("MicroPubApi:post_update:PARAMS", params)

    try {
      const response = await fetch('https://micro.blog/micropub', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${service.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error_description) {
          Alert.alert(
            "Something went wrong.",
            `${errorData.error_description}. Try again later.`
          )
        } else {
          Alert.alert(
            "Something went wrong.",
            "Please try again later."
          )
        }
        return POST_ERROR
      }

      return true
    } catch (error) {
      console.log(error)
      Alert.alert(
        "Something went wrong.",
        "Please try again later."
      )
      return POST_ERROR
    }
  }
}

export default new MicroPubApi()
