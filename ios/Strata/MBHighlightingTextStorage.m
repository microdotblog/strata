//
//  MBHighlightingTextStorage.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//  From Micro.blog 2.x iOS code, which was based on TKDHighlightingTextStorage by Max Seelemann.
//

#import "MBHighlightingTextStorage.h"

#import "MBHighlightingTextManager.h"

@implementation MBHighlightingTextStorage
{
  NSMutableAttributedString *_imp;
}

- (id) init
{
  self = [super init];
  if (self) {
    _imp = [[NSMutableAttributedString alloc] init];
  }
  
  return self;
}

- (NSString *) string
{
  return _imp.string;
}

- (NSString *) accessibilityValue
{
  return [self string];
}

- (NSDictionary *) attributesAtIndex:(NSUInteger)location effectiveRange:(NSRangePointer)range
{
  if (location < _imp.length) {
    return [_imp attributesAtIndex:location effectiveRange:range];
  }
  else {
    // hack to prevent being repeatedly called
    range->location = 0;
    range->length = NSUIntegerMax;
    return nil;
  }
}

- (void) replaceCharactersInRange:(NSRange)range withString:(NSString *)str
{
  [self beginEditing];

  [_imp replaceCharactersInRange:range withString:str];
  [self edited:NSTextStorageEditedCharacters | NSTextStorageEditedAttributes range:range changeInLength:(NSInteger)str.length - (NSInteger)range.length];
  
  [self endEditing];
  [self processAutocompleteAtRange:range];
}

- (void) setAttributes:(NSDictionary *)attrs range:(NSRange)range
{
  [self beginEditing];

  [_imp setAttributes:attrs range:range];
  [self edited:NSTextStorageEditedAttributes range:range changeInLength:0];
  
  [self endEditing];
}

#pragma mark -

- (void) safe_addAttribute:(NSAttributedStringKey)name value:(id)value range:(NSRange)range;
{
  NSString* s = self.string;
  if ((range.location + range.length) <= s.length) {
    [self addAttribute:name value:value range:range];
  }
}

- (void) safe_removeAttribute:(NSAttributedStringKey)name range:(NSRange)range;
{
  NSString* s = self.string;
  if ((range.location + range.length) <= s.length) {
    [self removeAttribute:name range:range];
  }
}

#pragma mark -

- (BOOL) isValidUsernameChar:(unichar)c
{
  return (isalnum (c) || (c == '_'));
}

- (void) processBold
{
  UIFont* bold_font = [UIFont boldSystemFontOfSize:[MBHighlightingTextManager preferredTimelineFontSize]];
  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_bold = NO;
  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }

    if ((c == '*') && (next_c == '*')) {
      if (!is_bold) {
        is_bold = YES;
        current_r.location = i;
      }
      else {
        is_bold = NO;
        current_r.length = i - current_r.location + 2;
        [self safe_addAttribute:NSFontAttributeName value:bold_font range:current_r];
      }
    }
  }
  
  if (is_bold) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSFontAttributeName value:bold_font range:current_r];
  }
}

- (void) processItalic
{
  UIFont* italic_font = [UIFont italicSystemFontOfSize:[MBHighlightingTextManager preferredTimelineFontSize]];
  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_italic = NO;
  BOOL is_link = NO;
  BOOL is_username = NO;

  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    unichar prev_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }
    if ((i - 1) > 0) {
      prev_c = [self.string characterAtIndex:i - 1];
    }

    if (c == '_') {
      if (!is_link && !is_username) {
        if (!is_italic) {
          if ((prev_c == ' ') || (prev_c == '\0')) {
            is_italic = YES;
            current_r.location = i;
          }
        }
        else {
          is_italic = NO;
          current_r.length = i - current_r.location + 1;
          [self safe_addAttribute:NSFontAttributeName value:italic_font range:current_r];
        }
      }
    }
    else if (c == '[') {
      if (!is_link) {
        is_link = YES;
      }
    }
    else if (c == ')') {
      if (is_link) {
        is_link = NO;
      }
    }
    else if (c == ')') {
      if (is_link) {
        is_link = NO;
      }
    }
    else if ((c == '@') && [self isValidUsernameChar:next_c]) {
      if (!is_username) {
        is_username = YES;
      }
    }
    else if (![self isValidUsernameChar:c]) {
      if (is_username) {
        is_username = NO;
      }
    }
  }
  
  if (is_italic) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSFontAttributeName value:italic_font range:current_r];
  }
}

- (void) processBlockquote
{
  UIColor* blockquote_c = [UIColor colorWithRed:0.0 green:0.598 blue:0.004 alpha:1.0];
  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_blockquote = NO;
  
  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }

    if ((i == 0) && (c == '>')) {
      if (!is_blockquote) {
        is_blockquote = YES;
        current_r.location = i;
      }
    }
    else if ((c == '\n') && (next_c == '>')) {
      if (!is_blockquote) {
        is_blockquote = YES;
        current_r.location = i + 1;
      }
    }
    else if ((c == '\n') && (next_c == '\n')) {
      if (is_blockquote) {
        is_blockquote = NO;
        current_r.length = i - current_r.location;
        [self safe_addAttribute:NSForegroundColorAttributeName value:blockquote_c range:current_r];
      }
    }
  }
  
  if (is_blockquote) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSForegroundColorAttributeName value:blockquote_c range:current_r];
  }
}

- (void) processLinks
{
  UIColor* title_c = [UIColor colorWithRed:0.2 green:0.478 blue:0.718 alpha:1.0];
  UIColor* url_c = [UIColor colorWithWhite:0.502 alpha:1.0];

  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_title = NO;
  BOOL is_url = NO;
  BOOL is_inbetween = NO;
  
  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }

    if (c == '[') {
      if (!is_title) {
        is_title = YES;
        current_r.location = i;
      }
    }
    else if (c == ']') {
      if (is_title) {
        is_title = NO;
        current_r.length = i - current_r.location + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:title_c range:current_r];
        
        if (next_c == '(') {
          is_inbetween = YES;
        }
      }
    }
    else if (c == '(') {
      if (is_inbetween && !is_url) {
        is_url = YES;
        current_r.location = i;
      }
      
      is_inbetween = NO;
    }
    else if (c == ')') {
      if (is_url) {
        is_url = NO;
        current_r.length = i - current_r.location + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:url_c range:current_r];
      }
    }
  }
  
  if (is_title) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSForegroundColorAttributeName value:title_c range:current_r];
  }
  else if (is_url) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSForegroundColorAttributeName value:url_c range:current_r];
  }
}

- (void) processUsernames
{
  UIColor* username_c = [UIColor colorWithWhite:0.502 alpha:1.0];

  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_username = NO;
  
  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }

    if ((c == '@') && [self isValidUsernameChar:next_c]) {
      if (!is_username) {
        is_username = YES;
        current_r.location = i;
      }
    }
    else if (![self isValidUsernameChar:c]) {
      if (is_username) {
        is_username = NO;
        current_r.length = i - current_r.location;
        [self safe_addAttribute:NSForegroundColorAttributeName value:username_c range:current_r];
      }
    }
  }
  
  if (is_username) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSForegroundColorAttributeName value:username_c range:current_r];
  }
}

- (void) processHeaders
{
  UIFont* header_font = [UIFont boldSystemFontOfSize:[MBHighlightingTextManager preferredTimelineFontSize]];
  UIColor* header_c = [UIColor colorNamed:@"color_editing_paragraph"];
  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_header = NO;
  
  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }

    if ((c == '\n') && (next_c == '#')) {
      if (!is_header) {
        is_header = YES;
        current_r.location = i + 1;
      }
    }
    else if ((i == 0) && (c == '#')) {
      if (!is_header) {
        is_header = YES;
        current_r.location = i;
      }
    }
    else if (c == '\n') {
      if (is_header) {
        is_header = NO;
        current_r.length = i - current_r.location;
        [self safe_addAttribute:NSFontAttributeName value:header_font range:current_r];
        [self safe_addAttribute:NSForegroundColorAttributeName value:header_c range:current_r];
      }
    }
  }
  
  if (is_header) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSFontAttributeName value:header_font range:current_r];
    [self safe_addAttribute:NSForegroundColorAttributeName value:header_c range:current_r];
  }
}

- (void) processTags
{
  UIColor* tag_c = [UIColor colorNamed:@"color_syntax_tags"];
  UIColor* attr_c = [UIColor colorWithWhite:0.502 alpha:1.0];
  UIColor* value_c = [UIColor colorWithRed:0.2 green:0.478 blue:0.718 alpha:1.0];
  NSRange current_r = NSMakeRange (0, 0);
  BOOL is_tag = NO;
  BOOL is_attr = NO;
  BOOL is_value = NO;
  BOOL is_quote = NO;
  NSInteger tag_start = 0;
  NSInteger attr_start = 0;
  NSInteger value_start = 0;
  
  for (NSInteger i = 0; i < self.string.length; i++) {
    unichar c = [self.string characterAtIndex:i];
    unichar next_c = '\0';
    if ((i + 1) < self.string.length) {
      next_c = [self.string characterAtIndex:i + 1];
    }

    if (c == '<') {
      if (!is_tag) {
        is_tag = YES;
        is_attr = NO;
        is_value = NO;
        attr_start = 0;
        value_start = 0;
        tag_start = i;
        current_r.location = i;
      }
    }
    else if (c == '"') {
      is_quote = !is_quote;
    }
    else if ((c == ' ') && !is_quote) {
      if (is_tag) {
        is_tag = NO;
        is_attr = YES;
        is_value = NO;
        current_r.length = i - current_r.location;
        attr_start = i + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:tag_c range:current_r];
      }
      else if (is_value) {
        is_tag = NO;
        is_attr = YES;
        is_value = NO;
        current_r.location = value_start;
        current_r.length = i - value_start;
        attr_start = i + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:value_c range:current_r];
      }
    }
    else if (c == '=') {
      if (is_attr) {
        is_attr = NO;
        is_value = YES;
        current_r.location = attr_start;
        current_r.length = i - attr_start;
        value_start = i + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:attr_c range:current_r];
      }
    }
    else if ((c == '/') && (next_c == '>')) {
      is_tag = YES;
      is_attr = NO;
      is_value = NO;
      tag_start = i;
    }
    else if (c == '>') {
      if (is_value) {
        is_tag = NO;
        is_attr = YES;
        is_value = NO;
        current_r.location = value_start;
        current_r.length = i - value_start;
        attr_start = i + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:value_c range:current_r];
      }
      else if (is_tag) {
        is_tag = NO;
        current_r.location = tag_start;
        current_r.length = i - tag_start + 1;
        [self safe_addAttribute:NSForegroundColorAttributeName value:tag_c range:current_r];
      }
    }
  }
  
  if (is_tag) {
    current_r.length = self.string.length - current_r.location;
    [self safe_addAttribute:NSForegroundColorAttributeName value:tag_c range:current_r];
  }
}

- (void) processAutocompleteAtRange:(NSRange)range
{
}

- (void) processEditing
{
  // clear fonts and colors
  NSRange paragraph_r = NSMakeRange (0, self.string.length);
  UIFont* normal_font = [UIFont systemFontOfSize:[MBHighlightingTextManager preferredTimelineFontSize]];
  UIColor* c = [UIColor blackColor];
  if (@available(iOS 11, *)) {
    c = [UIColor colorNamed:@"color_editing_paragraph"];
  }
  [self safe_removeAttribute:NSForegroundColorAttributeName range:paragraph_r];
  [self safe_removeAttribute:NSFontAttributeName range:paragraph_r];
  [self safe_addAttribute:NSFontAttributeName value:normal_font range:paragraph_r];
  [self safe_addAttribute:NSForegroundColorAttributeName value:c range:paragraph_r];

  // update style ranges
  [self processBold];
  [self processItalic];
  [self processBlockquote];
  [self processLinks];
  [self processUsernames];
  [self processHeaders];
  [self processTags];

  [super processEditing];
}

@end

