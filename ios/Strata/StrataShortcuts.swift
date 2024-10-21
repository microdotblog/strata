//
//  Shortcuts.swift
//  Strata
//
//  Created by Manton Reece on 10/21/24.
//

import AppIntents

@available(iOS 16.0, *)
struct StrataShortcuts: AppShortcutsProvider {
  
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CreateNoteIntent(),
      phrases: [
        "Create note in \(.applicationName)",
        "New note in \(.applicationName)",
        "Record note in \(.applicationName)"
      ],
      shortTitle: "New Note",
      systemImageName: "note"
    )
  }
  
}
