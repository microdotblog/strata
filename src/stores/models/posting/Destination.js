import { types } from 'mobx-state-tree';
import Post from "./Post";

export default Destination = types.model('Destination', {
	uid: types.identifier,
	name: types.maybeNull(types.string),
	"microblog-audio": types.optional(types.boolean, false),
	"microblog-default": types.optional(types.boolean, false),
	"microblog-title": types.maybeNull(types.string),
	categories: types.optional(types.array(types.string), []),
	syndicates: types.optional(types.array(types.model("Syndicate", {
		uid: types.identifier,
		name: types.maybeNull(types.string)
	})), []),
	posts: types.optional(types.array(Post), [])
})
.actions(self => ({

	set_categories(categories) {
		self.categories = categories;
	},

	set_default(is_default) {
		self[ "microblog-default" ] = is_default
	},
	
	set_syndicate_to_targets(syndicates){
		self.syndicates = syndicates
	},
	
	set_posts(entries) {
		console.log("Destination:set_posts", entries.length)
		const posts = entries.reduce((acc, entry) => {
			const uid = entry.properties.uid && entry.properties.uid[0] ? parseInt(entry.properties.uid[0], 10) : 0
			const name = entry.properties.name ? entry.properties.name[0] : ""
			const content = entry.properties.content ? entry.properties.content[0] : ""
			const published = entry.properties.published ? entry.properties.published[0] : ""
			const url = entry.properties.url ? entry.properties.url[0] : ""
			const post_status = entry.properties["post-status"] ? entry.properties["post-status"][0] : ""
			const categories = entry.properties.category ? entry.properties.category : []
			const post = {
				uid: uid,
				name: name,
				content: content,
				published: published,
				url: url,
				post_status: post_status,
				category: categories
			}
			if (uid === 0 || url === "") {
				return acc
			}
			return [...acc, post]
		}, [])
		console.log("Destination:set_posts:got_posts", posts.length)
		self.posts = posts // We could append to the list: [...self.posts, ...posts]
	}

}))
