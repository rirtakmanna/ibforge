// src/data/legalContent.js
//
// Legal page content for IBForge.
//
// Three named exports — each conforms to the LegalPage chassis schema
// documented in src/components/legal/LegalPage.jsx:
//
//   { title, lastUpdated, sections: [{ id, title, body: Node[] }] }
//
//   Node =
//     | { type: "paragraph", text }
//     | { type: "list",      items: string[] }
//     | { type: "heading",   level: 3 | 4, text }
//
// AUTHORING RULES (binding — see Project Instructions §Commercial
// Context Rules and CHAT_HANDOFF.md Override 10):
//
//  1. No inline HTML, no Markdown, no dangerouslySetInnerHTML — the
//     chassis renders Node[] directly. Bold lead-ins ("Personal
//     Information Provided by You.") are kept as plain text inside
//     paragraph nodes. Future visual emphasis = add a `lead` field
//     to the paragraph node (Phase 4B+ decision), don't smuggle in
//     HTML here.
//
//  2. Single public inbox throughout: hello@ibforge.in (Override 11).
//
//  3. Postal address city only: "Agra, Uttar Pradesh, India" — no
//     street, no postcode (Override 12).
//
//  4. No phone number in Terms §26 — only email + postal address.
//
//  5. Dates use the "15 May 2026" format. `lastUpdated` field on
//     each export carries the same string the page header displays.
//
//  6. Section ids are kebab-case slugs — stable URL anchors. Never
//     change an existing id after launch (breaks deep-links from
//     emails / customer support replies). New sections get new ids
//     appended; deleted sections leave their id retired forever.
//
//  7. ALL-CAPS paragraphs in Terms §14, §19, §20, §23 are preserved
//     exactly as the Termly draft wrote them. They're load-bearing
//     legally — the shouting is the convention, not a style choice.
//
//  8. The "Summary of Key Points" block in Privacy is its own section
//     (id: "summary"), listed in the TOC before "1. What information
//     do we collect?". The "*In Short:*" preambles at the top of each
//     Privacy section are plain paragraph nodes — the leading
//     "In Short: " is part of the text string.

// ───────────────────────────────────────────────────────────────────
// PRIVACY POLICY
// ───────────────────────────────────────────────────────────────────

export const privacyContent = {
  title: "Privacy Policy",
  lastUpdated: "15 May 2026",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      body: [
        {
          type: "paragraph",
          text: "This Privacy Notice for Rirtak Manna (doing business as IBForge) ('we', 'us', or 'our'), describes how and why we might access, collect, store, use, and/or share ('process') your personal information when you use our services ('Services'), including when you:",
        },
        {
          type: "list",
          items: [
            "Visit our website at https://ibforge.in or any website of ours that links to this Privacy Notice",
            "Use IBForge. IBForge is a structured Investment Banking analyst training program. Customers progress through 14 modules of locked, sequential steps, build financial models on real listed companies, upload deliverables as proof of completion, and generate LinkedIn posts from their completed work. The product runs as a web application at https://ibforge.in.",
            "Engage with us in other related ways, including any marketing or events",
          ],
        },
        {
          type: "paragraph",
          text: "Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at hello@ibforge.in.",
        },
      ],
    },

    {
      id: "summary",
      title: "Summary of Key Points",
      body: [
        {
          type: "paragraph",
          text: "This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.",
        },
        {
          type: "paragraph",
          text: "What personal information do we process? When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about personal information you disclose to us.",
        },
        {
          type: "paragraph",
          text: "Do we process any sensitive personal information? Some of the information may be considered 'special' or 'sensitive' in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.",
        },
        {
          type: "paragraph",
          text: "Do we collect any information from third parties? We do not collect any information from third parties.",
        },
        {
          type: "paragraph",
          text: "How do we process your information? We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about how we process your information.",
        },
        {
          type: "paragraph",
          text: "In what situations and with which parties do we share personal information? We may share information in specific situations and with specific third parties. Learn more about when and with whom we share your personal information.",
        },
        {
          type: "paragraph",
          text: "How do we keep your information safe? We have adequate organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about how we keep your information safe.",
        },
        {
          type: "paragraph",
          text: "What are your rights? Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about your privacy rights.",
        },
        {
          type: "paragraph",
          text: "How do you exercise your rights? The easiest way to exercise your rights is by emailing hello@ibforge.in, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.",
        },
        {
          type: "paragraph",
          text: "Want to learn more about what we do with any information we collect? Review the Privacy Notice in full.",
        },
      ],
    },

    {
      id: "information-we-collect",
      title: "1. What Information Do We Collect?",
      body: [
        {
          type: "heading",
          level: 3,
          text: "Personal information you disclose to us",
        },
        {
          type: "paragraph",
          text: "In Short: We collect personal information that you provide to us.",
        },
        {
          type: "paragraph",
          text: "We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.",
        },
        {
          type: "paragraph",
          text: "Personal Information Provided by You. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:",
        },
        {
          type: "list",
          items: [
            "Names",
            "Email addresses",
            "Contact or authentication data",
            "Google profile data (display name, photo, and Google account ID)",
            "Uploaded deliverable files (financial models, analyses, reports)",
            "UPI transaction reference numbers",
            "Payment screenshots",
          ],
        },
        {
          type: "paragraph",
          text: "Sensitive Information. We do not process sensitive information.",
        },
        {
          type: "paragraph",
          text: "Social Media Login Data. We may provide you with the option to register with us using your existing Google account, as described in the section called 'How Do We Handle Your Social Logins?' below.",
        },
        {
          type: "paragraph",
          text: "All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.",
        },
        {
          type: "heading",
          level: 3,
          text: "Google API",
        },
        {
          type: "paragraph",
          text: "Our use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
        },
      ],
    },

    {
      id: "how-we-process",
      title: "2. How Do We Process Your Information?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.",
        },
        {
          type: "paragraph",
          text: "We process your personal information for a variety of reasons, depending on how you interact with our Services, including:",
        },
        {
          type: "list",
          items: [
            "To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.",
            "To deliver and facilitate delivery of services to the user. We may process your information to provide you with the requested service.",
            "To respond to user inquiries/offer support to users. We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.",
            "To send administrative information to you. We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.",
            "To fulfil and manage your orders. We may process your information to fulfil and manage your orders and payments made through the Services.",
            "To protect our Services. We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.",
            "To comply with our legal obligations. We may process your information to comply with our legal obligations, respond to legal requests, and exercise, establish, or defend our legal rights.",
          ],
        },
      ],
    },

    {
      id: "share-information",
      title: "3. When and With Whom Do We Share Your Personal Information?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We may share information in specific situations described in this section and/or with the following third parties.",
        },
        {
          type: "paragraph",
          text: "Vendors, Consultants, and Other Third-Party Service Providers. We may share your data with third-party vendors, service providers, contractors, or agents ('third parties') who perform services for us or on our behalf and require access to such information to do that work.",
        },
        {
          type: "paragraph",
          text: "The third parties we may share personal information with are as follows:",
        },
        {
          type: "list",
          items: [
            "AI Service Providers: Google Gemini API",
            "Functionality and Infrastructure Optimisation: Cloud Firestore, Cloud Storage for Firebase, and Cloud Functions for Firebase",
            "User Account Registration and Authentication: Google Sign-In and Firebase Authentication",
            "Website Hosting: Netlify",
            "Email Delivery: Resend",
          ],
        },
        {
          type: "paragraph",
          text: "We also may need to share your personal information in the following situations:",
        },
        {
          type: "list",
          items: [
            "Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.",
          ],
        },
      ],
    },

    {
      id: "cookies",
      title: "4. Do We Use Cookies and Other Tracking Technologies?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We use essential cookies only. We do not run advertising or analytics tracking.",
        },
        {
          type: "paragraph",
          text: "We use cookies and similar essential tracking technologies to maintain your authenticated session, save your preferences, and assist with basic site functions. The only cookies set by our Services are those required by Firebase Authentication to keep you signed in.",
        },
        {
          type: "paragraph",
          text: "We do not run third-party analytics. We do not run advertising. We do not allow third parties to set tracking cookies on our Services. We do not send abandoned-cart reminders or behavioural advertising of any kind.",
        },
        {
          type: "paragraph",
          text: "If you disable cookies in your browser, the sign-in flow will not work — you will not be able to access the parts of the Services that require an account. The landing page and legal pages remain accessible without cookies.",
        },
      ],
    },

    {
      id: "ai-products",
      title: "5. Do We Offer Artificial Intelligence-Based Products?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.",
        },
        {
          type: "paragraph",
          text: "As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, 'AI Products'). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of the AI Products within our Services.",
        },
        {
          type: "heading",
          level: 3,
          text: "Use of AI Technologies",
        },
        {
          type: "paragraph",
          text: "We provide the AI Products through third-party service providers ('AI Service Providers'), including the Google Gemini API. As outlined in this Privacy Notice, your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products for purposes outlined in 'When and With Whom Do We Share Your Personal Information?' You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.",
        },
        {
          type: "heading",
          level: 3,
          text: "Our AI Products",
        },
        {
          type: "paragraph",
          text: "Our AI Products are designed for the following functions:",
        },
        {
          type: "list",
          items: [
            "AI text generation (project setup prompts, LinkedIn post drafting)",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "How We Process Your Data Using AI",
        },
        {
          type: "paragraph",
          text: "All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process.",
        },
      ],
    },

    {
      id: "social-logins",
      title: "6. How Do We Handle Your Social Logins?",
      body: [
        {
          type: "paragraph",
          text: "In Short: If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.",
        },
        {
          type: "paragraph",
          text: "Our Services offer you the ability to register and log in using your Google account (Google Sign-In). We do not support Facebook, X, or other social logins.",
        },
        {
          type: "paragraph",
          text: "Where you choose to do this, we will receive certain profile information about you from Google. The profile information we receive will include your display name, email address, and profile picture, as well as a unique Google account identifier.",
        },
        {
          type: "paragraph",
          text: "We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by Google. We recommend that you review the Google privacy notice to understand how Google collects, uses, and shares your personal information, and how you can set your privacy preferences.",
        },
      ],
    },

    {
      id: "retention",
      title: "7. How Long Do We Keep Your Information?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice unless otherwise required by law.",
        },
        {
          type: "paragraph",
          text: "We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.",
        },
        {
          type: "paragraph",
          text: "When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.",
        },
      ],
    },

    {
      id: "security",
      title: "8. How Do We Keep Your Information Safe?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We aim to protect your personal information through a system of organisational and technical security measures.",
        },
        {
          type: "paragraph",
          text: "We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.",
        },
      ],
    },

    {
      id: "minors",
      title: "9. Do We Collect Information From Minors?",
      body: [
        {
          type: "paragraph",
          text: "In Short: We do not knowingly collect data from or market to children under 18 years of age.",
        },
        {
          type: "paragraph",
          text: "We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at hello@ibforge.in.",
        },
      ],
    },

    {
      id: "privacy-rights",
      title: "10. What Are Your Privacy Rights?",
      body: [
        {
          type: "paragraph",
          text: "In Short: You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.",
        },
        {
          type: "paragraph",
          text: "Withdrawing your consent: If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section 'How Can You Contact Us About This Notice?' below.",
        },
        {
          type: "paragraph",
          text: "However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.",
        },
        {
          type: "heading",
          level: 3,
          text: "Account Information",
        },
        {
          type: "paragraph",
          text: "If you would at any time like to review or change the information in your account or terminate your account, you can:",
        },
        {
          type: "list",
          items: [
            "Log in to your account settings and update your user account.",
          ],
        },
        {
          type: "paragraph",
          text: "Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.",
        },
        {
          type: "paragraph",
          text: "Cookies and similar technologies: Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services.",
        },
        {
          type: "paragraph",
          text: "If you have questions or comments about your privacy rights, you may email us at hello@ibforge.in.",
        },
      ],
    },

    {
      id: "do-not-track",
      title: "11. Controls for Do-Not-Track Features",
      body: [
        {
          type: "paragraph",
          text: "Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ('DNT') feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.",
        },
      ],
    },

    {
      id: "updates",
      title: "12. Do We Make Updates to This Notice?",
      body: [
        {
          type: "paragraph",
          text: "In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.",
        },
        {
          type: "paragraph",
          text: "We may update this Privacy Notice from time to time. The updated version will be indicated by an updated 'Last updated' date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.",
        },
      ],
    },

    {
      id: "contact",
      title: "13. How Can You Contact Us About This Notice?",
      body: [
        {
          type: "paragraph",
          text: "If you have questions or comments about this notice, you may email us at hello@ibforge.in or contact us by post at:",
        },
        {
          type: "paragraph",
          text: "Rirtak Manna",
        },
        {
          type: "paragraph",
          text: "Agra, Uttar Pradesh, India",
        },
      ],
    },

    {
      id: "review-update-delete",
      title:
        "14. How Can You Review, Update, or Delete the Data We Collect From You?",
      body: [
        {
          type: "paragraph",
          text: "You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law.",
        },
        {
          type: "paragraph",
          text: "To request to review, update, or delete your personal information, please email hello@ibforge.in.",
        },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────
// TERMS OF SERVICE
// ───────────────────────────────────────────────────────────────────

export const termsContent = {
  title: "Terms of Service",
  lastUpdated: "15 May 2026",
  sections: [
    {
      id: "agreement",
      title: "Agreement to Our Legal Terms",
      body: [
        {
          type: "paragraph",
          text: "We are Rirtak Manna, doing business as IBForge ('Company', 'we', 'us', or 'our'), based in Agra, Uttar Pradesh, India.",
        },
        {
          type: "paragraph",
          text: "We operate the website https://ibforge.in (the 'Site'), as well as any other related products and services that refer or link to these legal terms (the 'Legal Terms') (collectively, the 'Services').",
        },
        {
          type: "paragraph",
          text: "IBForge is a structured Investment Banking analyst training program. Customers progress through 14 modules of locked, sequential steps, build financial models on real listed companies, upload deliverables as proof of completion, and generate LinkedIn posts from their completed work.",
        },
        {
          type: "paragraph",
          text: "You can contact us by email at hello@ibforge.in, or by mail to Agra, Uttar Pradesh, India.",
        },
        {
          type: "paragraph",
          text: "These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ('you'), and Rirtak Manna, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.",
        },
        {
          type: "paragraph",
          text: "We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you at hello@ibforge.in, as stated in the email message. By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.",
        },
        {
          type: "paragraph",
          text: "The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.",
        },
        {
          type: "paragraph",
          text: "We recommend that you print a copy of these Legal Terms for your records.",
        },
      ],
    },

    {
      id: "our-services",
      title: "1. Our Services",
      body: [
        {
          type: "paragraph",
          text: "The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.",
        },
        {
          type: "paragraph",
          text: "IBForge is a structured Investment Banking analyst training program. Customers progress through 14 modules of locked, sequential steps, build financial models on real listed companies, upload deliverables as proof of completion, and generate LinkedIn posts from their completed work. The product runs as a web application at https://ibforge.in.",
        },
        {
          type: "paragraph",
          text: 'The name "IBForge" refers to "Investment Banking Forge." IBForge is not affiliated with, endorsed by, or sponsored by the International Baccalaureate Organization (IBO).',
        },
        {
          type: "paragraph",
          text: "IBForge complies with applicable data protection laws, including India's Digital Personal Data Protection (DPDP) Act 2023 and, where applicable, the GDPR.",
        },
        {
          type: "paragraph",
          text: "IBForge does not guarantee specific career outcomes. IBForge is a training program. Skills built through the program and the portfolio produced are the customer's own work. Whether that work leads to a job offer, internship, interview, or salary outcome depends on the customer and on factors outside our control.",
        },
      ],
    },

    {
      id: "intellectual-property",
      title: "2. Intellectual Property Rights",
      body: [
        {
          type: "heading",
          level: 3,
          text: "Our intellectual property",
        },
        {
          type: "paragraph",
          text: "We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the 'Content'), as well as the trademarks, service marks, and logos contained therein (the 'Marks').",
        },
        {
          type: "paragraph",
          text: "Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.",
        },
        {
          type: "paragraph",
          text: "The Content and Marks are provided in or through the Services 'AS IS' for your personal, non-commercial use or internal business purpose only.",
        },
        {
          type: "heading",
          level: 3,
          text: "Your use of our Services",
        },
        {
          type: "paragraph",
          text: "Subject to your compliance with these Legal Terms, including the 'Prohibited Activities' section below, we grant you a non-exclusive, non-transferable, revocable licence to:",
        },
        {
          type: "list",
          items: [
            "Access the Services; and",
            "Download or print a copy of any portion of the Content to which you have properly gained access,",
          ],
        },
        {
          type: "paragraph",
          text: "solely for your personal, non-commercial use or internal business purpose.",
        },
        {
          type: "paragraph",
          text: "Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.",
        },
        {
          type: "paragraph",
          text: "If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: hello@ibforge.in. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.",
        },
        {
          type: "paragraph",
          text: "We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.",
        },
        {
          type: "paragraph",
          text: "Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.",
        },
        {
          type: "heading",
          level: 3,
          text: "Your submissions and contributions",
        },
        {
          type: "paragraph",
          text: "Please review this section and the 'Prohibited Activities' section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.",
        },
        {
          type: "paragraph",
          text: "Submissions: By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ('Submissions'), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.",
        },
        {
          type: "paragraph",
          text: "Contributions: The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality during which you may create, submit, post, display, transmit, publish, distribute, or broadcast content and materials to us or through the Services, including but not limited to text, writings, video, audio, photographs, music, graphics, comments, reviews, rating suggestions, personal information, or other material ('Contributions'). Any Submission that is publicly posted shall also be treated as a Contribution.",
        },
        {
          type: "paragraph",
          text: "You understand that Contributions may be viewable by other users of the Services and possibly through third-party websites.",
        },
        {
          type: "paragraph",
          text: "When you post Contributions, you grant us a licence (including use of your name, trademarks, and logos): By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including, without limitation, your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicence the licences granted in this section. Our use and distribution may occur in any media formats and through any media channels.",
        },
        {
          type: "paragraph",
          text: "This licence includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.",
        },
        {
          type: "paragraph",
          text: "You are responsible for what you post or upload: By sending us Submissions and/or posting Contributions through any part of the Services or making Contributions accessible through the Services by linking your account through the Services to any of your social networking accounts, you:",
        },
        {
          type: "list",
          items: [
            "Confirm that you have read and agree with our 'Prohibited Activities' and will not post, send, publish, upload, or transmit through the Services any Submission nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;",
            "To the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;",
            "Warrant that any such Submission and/or Contributions are original to you or that you have the necessary rights and licences to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and",
            "Warrant and represent that your Submissions and/or Contributions do not constitute confidential information.",
          ],
        },
        {
          type: "paragraph",
          text: "You are solely responsible for your Submissions and/or Contributions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party's intellectual property rights, or (c) applicable law.",
        },
        {
          type: "paragraph",
          text: "We may remove or edit your Content: Although we have no obligation to monitor any Contributions, we shall have the right to remove or edit any Contributions at any time without notice if in our reasonable opinion we consider such Contributions harmful or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also suspend or disable your account and report you to the authorities.",
        },
        {
          type: "heading",
          level: 3,
          text: "Copyright infringement",
        },
        {
          type: "paragraph",
          text: "We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately refer to the 'Copyright Infringements' section below.",
        },
      ],
    },

    {
      id: "user-representations",
      title: "3. User Representations",
      body: [
        {
          type: "paragraph",
          text: "By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Services for any illegal or unauthorised purpose; and (7) your use of the Services will not violate any applicable law or regulation.",
        },
        {
          type: "paragraph",
          text: "If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).",
        },
      ],
    },

    {
      id: "user-registration",
      title: "4. User Registration",
      body: [
        {
          type: "paragraph",
          text: "You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.",
        },
      ],
    },

    {
      id: "purchases-payment",
      title: "5. Purchases and Payment",
      body: [
        {
          type: "paragraph",
          text: "Purchases are refundable under our Refund Policy, which is available at https://ibforge.in/refund and is incorporated into these Legal Terms by reference. In summary: full refund within 7 days of purchase, no questions asked, returned to the same UPI ID you paid from. After 7 days, no refunds.",
        },
        {
          type: "paragraph",
          text: "We accept the following forms of payment:",
        },
        {
          type: "list",
          items: ["UPI"],
        },
        {
          type: "paragraph",
          text: "You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.",
        },
        {
          type: "paragraph",
          text: "Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in Indian Rupees (INR).",
        },
        {
          type: "paragraph",
          text: "You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorise us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.",
        },
        {
          type: "paragraph",
          text: "We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgement, appear to be placed by dealers, resellers, or distributors.",
        },
      ],
    },

    {
      id: "prohibited-activities",
      title: "6. Prohibited Activities",
      body: [
        {
          type: "paragraph",
          text: "You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavours except those that are specifically endorsed or approved by us.",
        },
        {
          type: "paragraph",
          text: "As a user of the Services, you agree not to:",
        },
        {
          type: "list",
          items: [
            "Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.",
            "Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.",
            "Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.",
            "Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.",
            "Use any information obtained from the Services in order to harass, abuse, or harm another person.",
            "Make improper use of our support services or submit false reports of abuse or misconduct.",
            "Use the Services in a manner inconsistent with any applicable laws or regulations.",
            "Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.",
            "Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.",
            "Delete the copyright or other proprietary rights notice from any Content.",
            "Attempt to impersonate another user or person or use the username of another user.",
            "Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats ('gifs'), 1x1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as 'spyware' or 'passive collection mechanisms' or 'pcms').",
            "Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.",
            "Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.",
            "Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.",
            "Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.",
            "Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.",
            "Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorised script or other software.",
            "Make any unauthorised use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretences.",
            "Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavour or commercial enterprise.",
            "Share account login credentials or provide platform access to unauthorised third parties.",
            "Attempt to scrape, crawl, or use automated software to extract training modules or proprietary data.",
            "Use the AI generation tools to intentionally generate harmful, illegal, or malicious content.",
          ],
        },
      ],
    },

    {
      id: "user-contributions",
      title: "7. User Generated Contributions",
      body: [
        {
          type: "paragraph",
          text: "The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, 'Contributions'). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary. When you create or make available any Contributions, you thereby represent and warrant that:",
        },
        {
          type: "list",
          items: [
            "The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.",
            "You are the creator and owner of or have the necessary licences, rights, consents, releases, and permissions to use and to authorise us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.",
            "You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.",
            "Your Contributions are not false, inaccurate, or misleading.",
            "Your Contributions are not unsolicited or unauthorised advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.",
            "Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libellous, slanderous, or otherwise objectionable (as determined by us).",
            "Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.",
            "Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.",
            "Your Contributions do not violate any applicable law, regulation, or rule.",
            "Your Contributions do not violate the privacy or publicity rights of any third party.",
            "Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.",
            "Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.",
            "Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.",
          ],
        },
        {
          type: "paragraph",
          text: "Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.",
        },
      ],
    },

    {
      id: "contribution-licence",
      title: "8. Contribution Licence",
      body: [
        {
          type: "paragraph",
          text: "By posting your Contributions to any part of the Services or making Contributions accessible to the Services by linking your account from the Services to any of your social networking accounts, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorise sublicences of the foregoing. The use and distribution may occur in any media formats and through any media channels.",
        },
        {
          type: "paragraph",
          text: "This licence will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide. You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.",
        },
        {
          type: "paragraph",
          text: "We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.",
        },
        {
          type: "paragraph",
          text: "We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorise any Contributions to place them in more appropriate locations on the Services; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.",
        },
      ],
    },

    {
      id: "social-media",
      title: "9. Social Media",
      body: [
        {
          type: "paragraph",
          text: "As part of the functionality of the Services, you may link your account with online accounts you have with third-party service providers (each such account, a 'Third-Party Account') by either: (1) providing your Third-Party Account login information through the Services; or (2) allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account.",
        },
        {
          type: "paragraph",
          text: "You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account.",
        },
        {
          type: "paragraph",
          text: "By granting us access to any Third-Party Accounts, you understand that (1) we may access, make available, and store (if applicable) any content that you have provided to and stored in your Third-Party Account (the 'Social Network Content') so that it is available on and through the Services via your account; and (2) we may submit to and receive from your Third-Party Account additional information to the extent you are notified when you link your account with the Third-Party Account.",
        },
        {
          type: "paragraph",
          text: "Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the Services. Please note that if a Third-Party Account or associated service becomes unavailable or our access to such Third-Party Account is terminated by the third-party service provider, then Social Network Content may no longer be available on and through the Services.",
        },
        {
          type: "paragraph",
          text: "You will have the ability to disable the connection between your account on the Services and your Third-Party Accounts at any time. PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS.",
        },
        {
          type: "paragraph",
          text: "We make no effort to review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or non-infringement, and we are not responsible for any Social Network Content. You can deactivate the connection between the Services and your Third-Party Account by contacting us using the contact information below or through your account settings (if applicable). We will attempt to delete any information stored on our servers that was obtained through such Third-Party Account, except the username and profile picture that become associated with your account.",
        },
      ],
    },

    {
      id: "third-party-content",
      title: "10. Third-Party Websites and Content",
      body: [
        {
          type: "paragraph",
          text: "The Services may contain (or you may be sent via the Site) links to other websites ('Third-Party Websites') as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ('Third-Party Content').",
        },
        {
          type: "paragraph",
          text: "Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content.",
        },
        {
          type: "paragraph",
          text: "Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us. If you decide to leave the Services and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Legal Terms no longer govern. You should review the applicable terms and policies, including privacy and data gathering practices, of any website to which you navigate from the Services or relating to any applications you use or install from the Services.",
        },
        {
          type: "paragraph",
          text: "Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases which are exclusively between you and the applicable third party. You agree and acknowledge that we do not endorse the products or services offered on Third-Party Websites and you shall hold us blameless from any harm caused by your purchase of such products or services. Additionally, you shall hold us blameless from any losses sustained by you or harm caused to you relating to or resulting in any way from any Third-Party Content or any contact with Third-Party Websites.",
        },
      ],
    },

    {
      id: "services-management",
      title: "11. Services Management",
      body: [
        {
          type: "paragraph",
          text: "We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.",
        },
      ],
    },

    {
      id: "privacy-policy-ref",
      title: "12. Privacy Policy",
      body: [
        {
          type: "paragraph",
          text: "We care about data privacy and security. Please review our Privacy Policy: https://ibforge.in/privacy. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.",
        },
        {
          type: "paragraph",
          text: "Please be advised the Services are hosted in India and use third-party infrastructure (Google Firebase, Netlify, Resend, Google Gemini API) that may store or process data outside India. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in India, then through your continued use of the Services, you are transferring your data to India (and to the third-party processors listed in the Privacy Policy), and you expressly consent to have your data transferred to and processed in those jurisdictions.",
        },
      ],
    },

    {
      id: "copyright-infringements",
      title: "13. Copyright Infringements",
      body: [
        {
          type: "paragraph",
          text: "We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately notify us using the contact information provided below (a 'Notification'). A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification.",
        },
        {
          type: "paragraph",
          text: "Please be advised that pursuant to applicable law you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the Services infringes your copyright, you should consider first contacting an attorney.",
        },
      ],
    },

    {
      id: "term-termination",
      title: "14. Term and Termination",
      body: [
        {
          type: "paragraph",
          text: "These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.",
        },
        {
          type: "paragraph",
          text: "If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.",
        },
      ],
    },

    {
      id: "modifications-interruptions",
      title: "15. Modifications and Interruptions",
      body: [
        {
          type: "paragraph",
          text: "We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.",
        },
        {
          type: "paragraph",
          text: "We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.",
        },
      ],
    },

    {
      id: "governing-law",
      title: "16. Governing Law",
      body: [
        {
          type: "paragraph",
          text: "These Legal Terms shall be governed by and defined following the laws of India. Rirtak Manna and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.",
        },
      ],
    },

    {
      id: "dispute-resolution",
      title: "17. Dispute Resolution",
      body: [
        {
          type: "heading",
          level: 3,
          text: "Informal Negotiations",
        },
        {
          type: "paragraph",
          text: "To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a 'Dispute' and collectively, the 'Disputes') brought by either you or us (individually, a 'Party' and collectively, the 'Parties'), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.",
        },
        {
          type: "heading",
          level: 3,
          text: "Binding Arbitration",
        },
        {
          type: "paragraph",
          text: "Any dispute, controversy, or claim arising out of or in connection with these Legal Terms, including any question regarding its existence, validity, or termination, shall be finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996 (India), as amended from time to time. The number of arbitrators shall be one (1). The seat of arbitration shall be New Delhi, India. The language of the proceedings shall be English. The substantive law governing these Legal Terms and any such arbitration shall be the law of India.",
        },
        {
          type: "heading",
          level: 3,
          text: "Restrictions",
        },
        {
          type: "paragraph",
          text: "The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilise class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.",
        },
        {
          type: "heading",
          level: 3,
          text: "Exceptions to Informal Negotiations and Arbitration",
        },
        {
          type: "paragraph",
          text: "The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorised use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.",
        },
      ],
    },

    {
      id: "corrections",
      title: "18. Corrections",
      body: [
        {
          type: "paragraph",
          text: "There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.",
        },
      ],
    },

    {
      id: "disclaimer",
      title: "19. Disclaimer",
      body: [
        {
          type: "paragraph",
          text: "THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORISED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGEMENT AND EXERCISE CAUTION WHERE APPROPRIATE.",
        },
      ],
    },

    {
      id: "limitations-liability",
      title: "20. Limitations of Liability",
      body: [
        {
          type: "paragraph",
          text: "IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING. CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.",
        },
      ],
    },

    {
      id: "indemnification",
      title: "21. Indemnification",
      body: [
        {
          type: "paragraph",
          text: "You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services.",
        },
        {
          type: "paragraph",
          text: "Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defence and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defence of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.",
        },
      ],
    },

    {
      id: "user-data",
      title: "22. User Data",
      body: [
        {
          type: "paragraph",
          text: "We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.",
        },
      ],
    },

    {
      id: "electronic-communications",
      title: "23. Electronic Communications, Transactions, and Signatures",
      body: [
        {
          type: "paragraph",
          text: "Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.",
        },
        {
          type: "paragraph",
          text: "YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.",
        },
      ],
    },

    {
      id: "california",
      title: "24. California Users and Residents",
      body: [
        {
          type: "paragraph",
          text: "If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.",
        },
      ],
    },

    {
      id: "miscellaneous",
      title: "25. Miscellaneous",
      body: [
        {
          type: "paragraph",
          text: "These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control.",
        },
        {
          type: "paragraph",
          text: "If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defences you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.",
        },
      ],
    },

    {
      id: "contact-us",
      title: "26. Contact Us",
      body: [
        {
          type: "paragraph",
          text: "In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:",
        },
        {
          type: "paragraph",
          text: "Rirtak Manna",
        },
        {
          type: "paragraph",
          text: "Agra, Uttar Pradesh, India",
        },
        {
          type: "paragraph",
          text: "Email: hello@ibforge.in",
        },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────
// REFUND POLICY
//
// Locked verbatim from the Step 7 kickoff plan (operator-authored).
// Four short sections; no TOC needed (Refund.jsx passes showToc={false}).
// ───────────────────────────────────────────────────────────────────

export const refundContent = {
  title: "Refund Policy",
  lastUpdated: "15 May 2026",
  sections: [
    {
      id: "full-refund",
      title: "1. Full refund within 7 days",
      body: [
        {
          type: "paragraph",
          text: "Any customer who purchased IBForge full access can request a full refund within 7 days of purchase. The refund will be sent to the same UPI ID used for the original payment, within 5 working days of the request. Refund requests after the 7-day window will not be honoured.",
        },
      ],
    },
    {
      id: "how-to-request",
      title: "2. How to request a refund",
      body: [
        {
          type: "paragraph",
          text: "Email hello@ibforge.in with the subject line 'Refund request' and your UPI transaction reference. No reasons or justifications required — we honour every refund inside the 7-day window without question.",
        },
      ],
    },
    {
      id: "why-no-refunds-after",
      title: "3. Why no refunds after 7 days",
      body: [
        {
          type: "paragraph",
          text: "Seven days is enough to open Module 1, see how the structure works, and know whether it fits how you operate. After that, you've started building. We can't refund work-in-progress because the value of IBForge is the doing, not the having.",
        },
      ],
    },
    {
      id: "trial-users",
      title: "4. Trial users",
      body: [
        {
          type: "paragraph",
          text: "Module 1 trial access is free. There is nothing to refund.",
        },
      ],
    },
    {
      id: "refund-contact",
      title: "Contact",
      body: [
        {
          type: "paragraph",
          text: "hello@ibforge.in",
        },
      ],
    },
  ],
};
