//
//  MBNotesCloudModule.m
//  Strata
//
//  Created by Manton Reece on 1/10/24.
//

#import "MBNotesCloudModule.h"

#import <CloudKit/CloudKit.h>

static NSString* const kNotesCloudContainer = @"iCloud.blog.micro.shared";
static NSString* const kNotesSettingsType = @"Setting";

@implementation MBNotesCloudModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setNotesKey:(NSString *)key)
{
  [self saveKeyToCloud:key];
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
      handler(nil);
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

- (void) saveKeyToCloud:(NSString *)key
{
  CKContainer* container = [CKContainer containerWithIdentifier:kNotesCloudContainer];

  [container accountStatusWithCompletionHandler:^(CKAccountStatus status, NSError* error) {
    if (status != CKAccountStatusAvailable) {
      NSLog(@"iCloud: User not signed in to iCloud.");
    }
    else {
      CKDatabase* db = [container privateCloudDatabase];
      CKRecord* record = [[CKRecord alloc] initWithRecordType:kNotesSettingsType];

      [record setObject:key forKey:@"notesKey"];
      
      [db saveRecord:record completionHandler:^(CKRecord* record, NSError* error) {
        if (error) {
          NSLog(@"iCloud: Error saving record: %@", error);
        }
        else {
          NSLog(@"iCloud: Saved secret key to the cloud.");
        }
      }];
    }
  }];
}

@end
