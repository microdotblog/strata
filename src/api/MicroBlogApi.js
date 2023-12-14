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

    const platformParams = Platform.select({
      android: { app_name: APP_NAME },
      ios: { is_mobile: 1 }
    })

    const queryParams = new URLSearchParams({
      email: email,
      redirect_url: REDIRECT_URL,
      ...platformParams
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

      const data = await response.json()
      console.log("MicroBlogApi:fetch_notebooks:response", data)
      return data

    } catch (error) {
      console.log(error)
      return API_ERROR
    }
  }

}

export default new MicroBlogApi()