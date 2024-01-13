import Auth from "../stores/Auth"

export const APP_NAME = "Strata"
export const REDIRECT_URL = "strata://signin/"
export const BASE_ENDPOINT = "https://micro.blog"
export const BASE_ACCOUNT_ENDPOINT = `${BASE_ENDPOINT}/account`
export const LOGIN_INCORRECT = 1
export const LOGIN_ERROR = 2
export const LOGIN_SUCCESS = 3
export const LOGIN_TOKEN_INVALID = 4
export const API_ERROR = 5
export const POST_ERROR = 6
export const DELETE_ERROR = 7

class MicroBlogApi {

  async login_with_token(token) {
    console.log('MicroBlogApi:login_with_token')
    try {
      const response = await fetch(`${BASE_ACCOUNT_ENDPOINT}/verify?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.error) {
        return LOGIN_TOKEN_INVALID
      } else {
        return data
      }
    } catch (error) {
      console.log(error)
      return LOGIN_ERROR
    }
  }

  async login_with_email(email) {
    console.log('MicroBlogApi:login_with_email', email);

    const queryParams = new URLSearchParams({
      email: email,
      redirect_url: REDIRECT_URL,
      app_name: APP_NAME
    }).toString()

    const url = `${BASE_ACCOUNT_ENDPOINT}/signin?${queryParams}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log("MicroBlogApi:login_with_email:response", data)

      if (data.error) {
        return LOGIN_INCORRECT
      } else {
        return LOGIN_SUCCESS
      }
    } catch (error) {
      console.log(error)
      return LOGIN_ERROR
    }
  }

  async fetch_notebooks() {
    console.log('MicroBlogApi:fetch_notebooks');

    try {
      const response = await fetch(`${BASE_ENDPOINT}/notes/notebooks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.text()
      return JSON.parse(data)

    } catch (error) {
      console.log(error)
      return API_ERROR
    }
  }

  async fetch_notes(notebook_id, user_token = Auth.selected_user?.token()) {
    console.log('MicroBlogApi:fetch_notes');

    try {
      const response = await fetch(`${BASE_ENDPOINT}/notes/notebooks/${notebook_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user_token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.text()
      return JSON.parse(data)

    } catch (error) {
      console.log(error)
      return API_ERROR
    }
  }

  async post_note(text, user_token, notebook_id = null, id = null, is_sharing = null, is_unsharing = null) {
    console.log('MicroBlogApi:post_note')

    let form = new FormData()
    if (text !== null) form.append('text', text)
    if (notebook_id !== null) form.append('notebook_id', notebook_id)
    if (id !== null) form.append('id', id)
    if (is_sharing !== null) form.append('is_sharing', is_sharing)
    if (is_unsharing !== null) form.append('is_unsharing', is_unsharing)

    try {
      const response = await fetch(`${BASE_ENDPOINT}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user_token}`
        },
        body: form
      })
      const data = await response.text()
      return data

    } catch (error) {
      console.log(error)
      return POST_ERROR
    }
  }

  async delete_notebook(notebook_id) {
    console.log('MicroBlogApi:delete_notebook', notebook_id);

    try {
      const response = await fetch(`${BASE_ENDPOINT}/notes/notebooks/${notebook_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.error) {
        return DELETE_ERROR
      } else {
        return true
      }

    } catch (error) {
      console.log(error)
      return DELETE_ERROR
    }
  }

  async create_or_rename_notebook(name, id = null) {
    console.log('MicroBlogApi:create_or_rename_notebook', name, id);

    let url = `${BASE_ENDPOINT}/notes/notebooks?name=${encodeURIComponent(name)}`
    if (id !== null) {
      url += `&id=${encodeURIComponent(id)}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.error) {
        return POST_ERROR
      } else {
        return data
      }

    } catch (error) {
      console.log(error)
      return POST_ERROR
    }
  }

  async delete_note(note_id) {
    console.log('MicroBlogApi:delete_note', note_id);

    try {
      const response = await fetch(`${BASE_ENDPOINT}/notes/${note_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.error) {
        return DELETE_ERROR
      } else {
        return true
      }

    } catch (error) {
      console.log(error)
      return DELETE_ERROR
    }
  }

}

export default new MicroBlogApi()