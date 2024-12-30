import { types, flow, destroy } from 'mobx-state-tree';
import Service from './posting/Service';
import { blog_services } from './../enums/blog_services';
import { Alert, Platform, Linking } from 'react-native';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';
import App from '../App'
import Clipboard from '@react-native-clipboard/clipboard';
import Tokens from '../Tokens';
import md from 'markdown-it';
const parser = md({ html: true });

export default Posting = types.model('Posting', {
  username: types.identifier,
  services: types.optional(types.array(Service), []),
  selected_service: types.maybeNull(types.reference(Service)),
  post_text: types.optional(types.string, ""),
  post_title: types.maybeNull(types.string),
  is_sending_post: types.optional(types.boolean, false),
  post_categories: types.optional(types.array(types.string), []),
  post_syndicates: types.optional(types.array(types.string), []),
  post_status: types.optional(types.string, "published"),
  is_adding_bookmark: types.optional(types.boolean, false),
  text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
  text_selection_flat: types.optional(types.string, ""),
  post_url: types.maybeNull(types.string),
  show_title: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Posting:hydrate", self.username, blog_services)
    // We want to keep everything generic, but for now load just Micro.blog
    if(self.services.length === 0){
      const blog_service = blog_services["microblog"]
      if(blog_service){
        console.log("Posting:hydrate:blog_service", blog_service)
        const new_service = Service.create({
          id: `endpoint_${blog_service.name}-${self.username}` ,
          name: blog_service.name,
          url: blog_service.url,
          username: self.username,
          type: blog_service.type,
          is_microblog: true
        })
        if(new_service){
          self.services.push(new_service)
          self.selected_service = new_service
        }
      }
    }
    else if(self.selected_service == null){
      // We want to select one default endpoint
      self.selected_service = self.services[0]
    }
    self.is_sending_post = false
    self.is_adding_bookmark = false
    self.text_selection_flat = ""
    
    self.reset_post_syndicates()

    if (App.is_share_extension) {
      self.post_text = ""
    }

  }),
  
  hydrate_post_with_markdown: flow(function* (markdown) {
    console.log("hydrate_post_with_markdown", markdown)
    self.post_text = markdown
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),
  
  set_post_text: flow(function* (value) {
		self.post_text = value
  }),

  set_post_text_from_typing: flow(function* (value) {
    self.post_text = value
    App.check_usernames(self.post_text)
  }),
  
  set_post_text_from_action: flow(function* (value) {
    self.post_text = decodeURI(value.replace("strata://post?text=", "").replace(/%3A/g, ":"))
  }),
  
  set_post_title: flow(function* (value) {
		self.post_title = value === "" ? null : value
  }),
  
  send_post: flow(function* () {
		console.log("Posting:send_post", self.post_text, self.selected_service.service_object().destination)
    if(self.post_text === ""){
      Alert.alert(
        "Whoops...",
        "There is nothing to post... type something to get started."
      )
      return false
    }
    if(self.is_sending_post){
      Alert.alert(
        "Whoops...",
        "We're already sending another message, please wait and try again."
      )
      return false
    }
    self.is_sending_post = true
    const post_success = yield MicroPubApi.send_post(self.selected_service.service_object(), self.post_text, self.post_title, self.post_categories, self.post_status, self.post_syndicates.length === self.selected_service.active_destination()?.syndicates?.length ? null : self.post_syndicates)
    if(post_success !== POST_ERROR){
      self.post_text = ""
      self.post_title = null
      self.post_assets = []
      self.post_categories = []
      self.post_status = "published"
      if(self.selected_service && self.selected_service.active_destination()?.syndicates?.length > 0){
        let syndicate_targets = []
        self.selected_service.active_destination()?.syndicates.forEach((syndicate) => {
          syndicate_targets.push(syndicate.uid)
        })
        self.post_syndicates = syndicate_targets
      }
      self.is_sending_post = false
      return true
    }
    self.is_sending_post = false
    return false
  }),
  
  handle_text_action: flow(function* (action) {
    console.log("Posting:handle_text_action", action)
    let has_web_url = null
    const is_link = action === "[]"
    if (is_link) {
      action = "[]()"
      let url = null
      if (Platform.OS === "ios") {
        has_web_url = yield Clipboard.hasWebURL()
      }
      else {
        url = yield Clipboard.getString()
        has_web_url = yield Linking.canOpenURL(url)
        // I'm using this as a fallback, as Android sometimes doesn't know that it can open a URL.
        if (!has_web_url) {
          has_web_url = url.startsWith("http://") || url.startsWith("https://")
        }
      }
      console.log("HAS WEB URL", url, has_web_url)
      if (has_web_url) {
        if (url === null) {
          url = yield Clipboard.getString()
        }
        action = `[](${ url })`
        console.log("TEXT OPTION", action)
        self.post_text = self.post_text.InsertTextStyle(action, self.text_selection, true, url)
      }
      else {
        self.post_text = self.post_text.InsertTextStyle(action, self.text_selection, true)
      }
    }
    else {
      self.post_text = self.post_text.InsertTextStyle(action, self.text_selection, is_link)
    }

    let new_pos = self.text_selection.end;
    if (is_link) {
      if (has_web_url) {
        new_pos += action.length;
      }
      else {
        new_pos += (action.length - 1);
      }
    }
    else {
      new_pos += (action.length * 2);
    }
    self.text_selection = { start: new_pos, end: new_pos };
    self.text_selection_flat = `${new_pos} ${new_pos}`;
    console.log("text_selection_flat", new_pos);
  }),

  remove_post_categories: flow(function* () {
    console.log("Posting:remove_post_categories")
    self.post_categories = []
  }),

  handle_post_category_select: flow(function* (category) {
    console.log("Posting:handle_post_category_select")
    if (self.post_categories.includes(category)) {
      self.post_categories = self.post_categories.filter(c => c !== category)
    } else {
      self.post_categories.push(category)
    }
  }),

  handle_post_status_select: flow(function* (status) {
    console.log("Posting:handle_post_status_select: " + status)
    self.post_status = status
  }),

  add_bookmark: flow(function* (url) {
    console.log("Posting:add_bookmark", url)
    self.is_adding_bookmark = true
    const post_success = yield MicroPubApi.send_entry(self.selected_service.service_object(), url, "bookmark-of")
    self.is_adding_bookmark = false
    if (post_success !== POST_ERROR) {
      App.show_toast_message("bookmark_added")
      return true
    }
    return false
  }),

  set_text_selection: flow(function* (selection) {
    self.text_selection = selection
  }),
  
  clear_post: flow(function* () {
    self.post_text = ""
    self.post_title = null
    self.post_assets = []
    self.post_categories = []
    self.post_url = null
    self.show_title = false
    self.reset_post_syndicates()
  }),
  
  create_new_service: flow(function* (blog_service, name, endpoint, username, blog_id = null) {
    console.log("Posting:create_new_service", blog_service, endpoint, username)
    const service_id = `endpoint_${blog_service.name}-${username}-${name}`
    const existing_service = self.services.find(s => s.id === service_id)
    if(existing_service != null){
      destroy(existing_service)
    }
    const new_service = Service.create({
      id: service_id,
      name: name,
      url: endpoint,
      username: username,
      type: blog_service.type,
      is_microblog: false,
      blog_id: blog_id
    })
    if(new_service){
      self.services.push(new_service)
      return new_service
    }
    return false
  }),
  
  activate_new_service: flow(function* (service = null) {
    if(service === null){return false}
    self.selected_service = service
    console.log("Posting:activate_new_service", service)
    return true
  }),
  
  set_default_service: flow(function* () {
    if(self.services.length > 0){
      self.selected_service = self.services[0]
      return self.selected_service
    }
    return false
  }),
  
  set_custom_service: flow(function* () {
    if(self.services.length > 0 && self.first_custom_service() != null){
      self.selected_service = self.first_custom_service()
      return self.selected_service
    }
    return false
  }),
  
  remove_custom_services: flow(function* () {
    console.log("Posting:remove_custom_services")
    const services = self.services.filter(s => !s.is_microblog)
    if(services){
      services.forEach((service) => {
        Tokens.destroy_token_for_service_id(service.id)
        destroy(service)
      })
    }
  }),
  
  handle_post_syndicates_select: flow(function* (uid) {
    console.log("Posting:handle_post_syndicates_select")
    if (self.post_syndicates.includes(uid)) {
      self.post_syndicates = self.post_syndicates.filter(s => s !== uid)
    } else {
      self.post_syndicates.push(uid)
    }
  }),
  
  reset_post_syndicates: flow(function* () {
    console.log("Posting:reset_post_syndicates")
    if(self.selected_service && self.selected_service.active_destination()?.syndicates?.length > 0){
      let syndicate_targets = []
      self.selected_service.active_destination()?.syndicates.forEach((syndicate) => {
        syndicate_targets.push(syndicate.uid)
      })
      self.post_syndicates = syndicate_targets
    }
  }),
  
  toggle_title: flow(function* () {
    console.log("Posting:toggle_title")
    if(self.post_title){return}
    self.show_title = !self.show_title
  }),
  
  add_to_post_text: flow(function* (text) {
    self.post_text += text
  }),
  
}))
.views(self => ({
  
  posting_enabled(){
    return self.username != null && self.services != null && self.selected_service && self.selected_service.credentials()?.token != null
  },
  
  first_custom_service(){
    return self.services != null && self.services.length > 1 ? self.services.find(s => !s.is_microblog) : null
  },
  
  post_text_length(){
    const html = parser.render(self.post_text)
    const regex = /(<([^>]+)>)/ig
    var text = html.replace(regex, '')

    // if last char is a newline, chop it off
    if (text[text.length - 1] == '\n') {
      text = text.substring(0, text.length - 1)
    }

    return text ? text.length : 0
  },
  
  max_post_length(){
    const html = parser.render(self.post_text)
    const has_blockquote = html.includes('<blockquote')
    return has_blockquote ? App.max_characters_allowed * 2 : App.max_characters_allowed
  },
  
  post_chars_offset(is_post_edit) {
    var offset = 0
    if (is_post_edit) {
      offset = -55
    }
    else {
      offset = -35
    }
    
    return offset
  },

  reply_chars_offset() {
    var offset = -25
    return offset
  },
  
  should_show_title(){
    return self.show_title || this.post_text_length() > this.max_post_length() || self.post_title
  }
  
}))
