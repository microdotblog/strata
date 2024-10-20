//
//  MBNotesScriptingModule.h
//  Strata
//
//  Created by Manton Reece on 10/20/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@interface MBNotesScriptingModule : RCTEventEmitter

- (void) emitEventToJS;

@end

NS_ASSUME_NONNULL_END
