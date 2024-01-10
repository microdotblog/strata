//
//  MBNotesKeyModule.m
//  Strata
//
//  Created by Manton Reece on 1/10/24.
//

#import "MBNotesKeyModule.h"

#import <CloudKit/CloudKit.h>

static NSString* const kNotesCloudContainer = @"iCloud.blog.micro.shared";
static NSString* const kNotesSettingsType = @"Setting";

@implementation MBNotesKeyModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setNotesKey:(NSString *)key)
{
  NSLog(@"setting notes key");
}

RCT_EXPORT_METHOD(getNotesKey:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  [self fetchKeyFromCloudWithCompletion:^(NSString* key) {
      resolve(key);
  }];
}

- (void) fetchKeyFromCloudWithCompletion:(void (^)(NSString* key))handler
{
  CKContainer* container = [CKContainer containerWithIdentifier:kNotesCloudContainer];

  [container accountStatusWithCompletionHandler:^(CKAccountStatus status, NSError* error) {
    if (status != CKAccountStatusAvailable) {
      NSLog(@"iCloud: User not signed in to iCloud.");
    }
    else {
      CKDatabase* db = [container privateCloudDatabase];
      
      NSPredicate* predicate = [NSPredicate predicateWithValue:YES]; // match all records of type
      CKQuery* query = [[CKQuery alloc] initWithRecordType:kNotesSettingsType predicate:predicate];
      
      CKQueryOperation* op = [[CKQueryOperation alloc] initWithQuery:query];
      op.resultsLimit = 1;
      
      __block NSString* found_key = nil;
      
      [op setRecordFetchedBlock:^(CKRecord* record) {
        NSLog(@"iCloud: Got Record: %@", record);
        found_key = [record objectForKey:@"notesKey"];
      }];

      [op setQueryCompletionBlock:^(CKQueryCursor* cursor, NSError* error) {
        if (error) {
          NSLog(@"iCloud: Error querying records: %@", error);
          handler(nil);
        }
        else {
          NSLog(@"iCloud: Query successful.");
          handler(found_key);
        }
      }];

      [db addOperation:op];
    }
  }];
}

@end
