import { registerSheet } from 'react-native-actions-sheet';
import LoginMessageSheet from './login_message';
import SecretKeyPromptSheet from './secret_key_prompt';

registerSheet("login-message-sheet", LoginMessageSheet)
registerSheet("secret-key-prompt-sheet", SecretKeyPromptSheet)

export { }