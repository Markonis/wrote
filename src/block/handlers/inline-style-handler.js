export function handleInlineStyles(block, e) {
  // Check for Ctrl/Cmd key combination
  const isCtrlOrCmd = e.ctrlKey || e.metaKey;

  if (!isCtrlOrCmd) {
    return false;
  }

  // Ensure semantic HTML formatting instead of CSS styles
  document.execCommand('styleWithCSS', false, false);

  switch (e.key.toLowerCase()) {
    case 'b':
      document.execCommand('bold', false, null);
      return true;
    case 'i':
      document.execCommand('italic', false, null);
      return true;
    case 'u':
      document.execCommand('underline', false, null);
      return true;
    default:
      return false;
  }
}
