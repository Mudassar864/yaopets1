import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy - YaoPets</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Data Collection and Use</h2>
          <p className="mb-4">
            YaoPets only collects the information necessary to provide our services. We collect:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Profile information (name, email, photo)</li>
            <li>Location data to show nearby pets</li>
            <li>Photos and information of registered pets</li>
            <li>Messages exchanged between users</li>
            <li>Information about donations and veterinary help requests</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Use of Data</h2>
          <p className="mb-4">Your data is used to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Connect people who lost pets with those who found them</li>
            <li>Facilitate responsible adoption processes</li>
            <li>Enable donations and veterinary assistance</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Data Sharing</h2>
          <p className="mb-4">
            We do not sell your personal data. We only share information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Between users involved in the same action (adoption, donation, etc.)</li>
            <li>With service providers necessary for the platform operation</li>
            <li>When required by law or court order</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a readable format</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Data Deletion</h2>
          <p className="mb-4">
            When you request data deletion:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your account will be deactivated within 48 hours</li>
            <li>Your personal data will be removed</li>
            <li>Posts and photos will be anonymized</li>
            <li>Messages will be deleted</li>
          </ul>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Request Deletion</h3>
            <p className="text-red-700 mb-4 text-sm">
              This action is irreversible. All your data will be permanently deleted.
            </p>
            <Button variant="destructive" className="w-full">
              Request Data Deletion
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
          <p className="mb-4">
            We implement technical and organizational measures to protect your data:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Encryption in transit and at rest</li>
            <li>Restricted access on a need-to-know basis</li>
            <li>Continuous security monitoring</li>
            <li>Regular and secure backups</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
          <p className="mb-2">
            For questions regarding privacy or data-related requests:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email: privacy@yaopets.lat</li>
            <li>Website: yaopets.lat/politicadedados</li>
          </ul>
        </section>
      </Card>
    </div>
  );
}