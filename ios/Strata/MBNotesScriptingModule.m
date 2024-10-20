//
//  MBNotesScriptingModule.m
//  Strata
//
//  Created by Manton Reece on 10/20/24.
//

#import "MBNotesScriptingModule.h"

@implementation MBNotesScriptingModule

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *) supportedEvents
{
  return @[ @"CreateNote" ];
}

- (void) emitEventToJS
{
  [self sendEventWithName:@"CreateNote" body:@{}];
}

@end
