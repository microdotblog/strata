import { registerSheet } from 'react-native-actions-sheet';
import LoginMessageSheet from './login_message';
import SecretKeyPromptSheet from './secret_key_prompt';
import MenuSheet from './menu';
import NotebooksListSheet from './notebooks_list';

registerSheet("login-message-sheet", LoginMessageSheet)
registerSheet("secret-key-prompt-sheet", SecretKeyPromptSheet)
registerSheet("menu-sheet", MenuSheet)
registerSheet("notebooks-list", NotebooksListSheet)

export { }