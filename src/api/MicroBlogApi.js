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

  async post_note(text = null, user_token, notebook_id = null, id = null, is_encrypted = true, is_sharing = null, is_unsharing = null) {
    console.log('MicroBlogApi:post_note')

    let form = new FormData()
    if (text !== null) form.append('text', text)
    if (notebook_id !== null) form.append('notebook_id', notebook_id)
    if (id !== null) form.append('id', id)
    if (is_sharing !== null) form.append('is_sharing', is_sharing)
    if (is_unsharing !== null) form.append('is_unsharing', is_unsharing)
    form.append('is_encrypted', is_encrypted)

    try {
      const response = await fetch(`${BASE_ENDPOINT}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user_token}`
        },
        body: form
      })
      const data = await response.json()
      if (data.error) {
        return POST_ERROR
      }
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
  
  async get_centralized_key(username) {
    try {
      const response = await fetch(`${BASE_ACCOUNT_ENDPOINT}/notes/centralkey?username=${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'
        }
      })
    
      const data = await response.text()
      const info = JSON.parse(data);
      return info.key;    
    } catch (error) {
      console.log(error)
      return API_ERROR
    }    
  }
  
  async get_bookmarks(before_id = null, tag = null) {
    try {
      let request_path = 'posts/bookmarks'
      if (before_id && tag == null){
        request_path += `?before_id=${before_id}`
      }
      else if (tag){
        request_path += `?tag=${tag}`
      }
      const response = await fetch(`${BASE_ENDPOINT}/${request_path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'          
        }
      })
      const data = await response.text()
      return JSON.parse(data)
    } catch(error) {
      console.log(error)
      return API_ERROR
    }
  }
  
  async delete_bookmark(id) {
    try{
      const response = await fetch(`${BASE_ENDPOINT}/posts/bookmarks/${id}`, {
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
    }
    catch(error) {
      console.log(error)
      return DELETE_ERROR
    }
  }
  
  async get_bookmark_tags(recent = false, count = 10) {
    const path = recent ? `tags?recent=1&count=${count}` : 'tags'
    try{
      const response = await fetch(`${BASE_ENDPOINT}/posts/bookmarks/${path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'    
        }
      })
      const data = await response.text()
      return JSON.parse(data)
    }
    catch(error) {
      console.log(error)
      return API_ERROR
    }
  }
  
  async get_highlights() {
    try{
      const response = await fetch(`${BASE_ENDPOINT}/posts/bookmarks/highlights`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'          
        }
      })
      const data = await response.text()
      return JSON.parse(data)
    } catch(error) {
      console.log(error)
      return API_ERROR
    }
  }
  
  async delete_highlight(id) {
    try{
      const response = await fetch(`${BASE_ENDPOINT}/posts/bookmarks/highlights/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'          
        }
      })
      return await response.json()
    }
    catch(error) {
      console.log(error)
      return DELETE_ERROR
    }
  }
  
  async get_tags(recent = null, count = 10) {
    let params = ""
    if(recent){
      params = `?recent=1&count=${count}`
    }
    try{
      const response = await fetch(`${BASE_ENDPOINT}/posts/bookmarks/tags${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Auth.selected_user?.token()}`,
          'Content-Type': 'application/json'          
        }
      })
      const data = await response.text()
      return JSON.parse(data)
    } catch(error) {
      console.log(error)
      return API_ERROR
    }
  }
  
  async save_tags_for_bookmark(id, tags) {
    console.log('MicroBlogApi: save_tags_for_bookmark', id, tags);
    
    try {
      const response = await fetch(`${BASE_ENDPOINT}/posts/bookmarks/${id}?tags=${tags}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Auth.selected_user?.token()}`,
            'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || API_ERROR;
        
    } catch (error) {
        console.log('MicroBlogApi: save_tags_for_bookmark_by_id', error);
        return API_ERROR;
    }
  }

}

export default new MicroBlogApi()
