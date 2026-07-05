import UIKit
import Capacitor
import WebKit

// Aktiviert den Safari Web Inspector auch für Release-/TestFlight-Builds.
// WICHTIG: Nach dem Debugging wieder entfernen bzw. isInspectable = false
// setzen, bevor die App final im App Store veröffentlicht wird.
class DebugBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        if #available(iOS 16.4, *) {
            self.webView?.isInspectable = true
        }
    }
}
