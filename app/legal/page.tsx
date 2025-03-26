"use client";

import React from "react";
import { useConfig } from "@/lib/config/useConfig";

export default function LegalPage() {
  const { productConfig } = useConfig();
  const productName = productConfig?.name || "Project Mosaic";
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Legal Information</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
        <div className="prose max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">1. Introduction</h3>
          <p>
            Welcome to {productName}. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">2. Data We Collect</h3>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Identity Data: includes first name, last name, username or similar identifier</li>
            <li>Contact Data: includes email address and telephone numbers</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</li>
            <li>Usage Data: includes information about how you use our website and services</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">3. How We Use Your Data</h3>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you</li>
            <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests</li>
            <li>Where we need to comply with a legal obligation</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">4. Data Security</h3>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">5. Contact Us</h3>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
            <br />
            Email: support@example.com
          </p>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
        <div className="prose max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">1. Agreement to Terms</h3>
          <p>
            By accessing or using {productName}, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">2. Use License</h3>
          <p>
            Permission is granted to temporarily use {productName} for personal, non-commercial transitory viewing only.
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on {productName}</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">3. Disclaimer</h3>
          <p>
            The materials on {productName} are provided on an 'as is' basis. {productName} makes no warranties, expressed or implied,
            and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">4. Limitations</h3>
          <p>
            In no event shall {productName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
            or due to business interruption) arising out of the use or inability to use {productName}, even if {productName} or a {productName} authorized
            representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h3 className="text-xl font-medium mt-6 mb-3">5. Governing Law</h3>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
          
          <p className="mt-8">
            &copy; {currentYear} {productName}. All Rights Reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
