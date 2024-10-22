//
//  CreateNoteIntent.swift
//  Strata
//
//  Created by Manton Reece on 10/21/24.
//

import AppIntents

@available(iOS 16, *)
struct CreateNoteIntent: AppIntent {
  
  static let title: LocalizedStringResource = "Create Note";
  static let openAppWhenRun: Bool = true;
  
  @Parameter(title: "Contents") var contents: String?
  
  func perform() async throws -> some IntentResult {
    print("Intent: Got note");
    if let contents = contents {
      print("Intent: Contents: \(contents)");
    }

    DispatchQueue.main.async {
      if let delegate = UIApplication.shared.delegate as? AppDelegate {
        delegate.handleNewNote()
      }
    }
    
    return .result()
  }
  
}
