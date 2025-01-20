import { registerSheet } from 'react-native-actions-sheet';
import LoginMessageSheet from './login_message';
import SecretKeyPromptSheet from './secret_key_prompt';
import MenuSheet from './menu';
import NotebooksListSheet from './notebooks_list';
import TagsMenu from './tags';
import AddTagsMenu from './add_tags';

registerSheet("login-message-sheet", LoginMessageSheet)
registerSheet("secret-key-prompt-sheet", SecretKeyPromptSheet)
registerSheet("menu-sheet", MenuSheet)
registerSheet("notebooks-list", NotebooksListSheet)
registerSheet("tags", TagsMenu)
registerSheet("add-tags", AddTagsMenu)

export { }
