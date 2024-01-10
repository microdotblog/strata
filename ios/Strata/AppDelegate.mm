#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <CloudKit/CloudKit.h>

static NSString* const kNotesCloudContainer = @"iCloud.blog.micro.shared";
static NSString* const kNotesSettingsType = @"Setting";

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Strata";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [self fetchKeyFromCloudWithCompletion:^(NSString* key) {
    NSLog(@"Got the key yes! %@", key);
  }];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
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
