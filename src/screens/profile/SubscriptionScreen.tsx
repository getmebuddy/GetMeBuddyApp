import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, Button, Divider } from 'react-native-elements'; // CheckBox not used here
import { StackScreenProps } from '@react-navigation/stack';

import {
  fetchSubscriptionPlans, fetchUserSubscription, createCheckoutSession, cancelSubscription,
} from '../../store/actions/monetizationActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
import { AppStackParamList } from '../../navigation'; // Assuming SubscriptionScreen is in AppStack

// Types
export interface SubscriptionPlan {
  id: string | number;
  name: string;
  price: number; // Or string, depending on API
  interval: 'month' | 'year' | string; // Allow other intervals if any
  description: string;
  features: string[];
  is_popular?: boolean;
  // Add stripe_price_id or similar if used for payment processing
}

export interface UserSubscriptionData {
  id: string | number;
  plan: SubscriptionPlan; // Embed full plan or just key fields
  status: 'active' | 'cancelled' | 'expired' | 'pending' | string; // Allow other statuses
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  // renewal_date?: string; // ISO date string - often same as end_date for next period
  // Add other relevant fields like payment_method_details, etc.
}

// Navigation props
type SubscriptionScreenProps = StackScreenProps<AppStackParamList, 'SubscriptionScreen'>;

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, userSubscription, loading, processingPayment } = useSelector((state: RootState) => state.monetization as {
    plans: SubscriptionPlan[] | null;
    userSubscription: UserSubscriptionData | null;
    loading: boolean;
    processingPayment?: boolean; // Optional, if not always present
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string | number | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0); // e.g., 20 for 20%

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    if (userSubscription && plans) {
      setSelectedPlanId(userSubscription.plan.id);
    } else if (plans && plans.length > 0 && !selectedPlanId) {
      // Default to the first plan, or a popular one
      const popularPlan = plans.find(p => p.is_popular) || plans[0];
      setSelectedPlanId(popularPlan.id);
    }
  }, [userSubscription, plans, selectedPlanId]);

  const loadData = async () => {
    try { await Promise.all([dispatch(fetchSubscriptionPlans()), dispatch(fetchUserSubscription())]); }
    catch (error) { console.error('Error loading subscription data:', error); Alert.alert('Error', 'Failed to load subscription information.'); }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) { Alert.alert('Error', 'Please enter a promotion code.'); return; }
    // TODO: Backend validation for promo code
    setPromoApplied(true); setDiscountPercent(20); // Simulate 20%
    Alert.alert('Success', 'Promotion code applied: 20% off!');
  };

  const handleSubscribeAction = async () => {
    if (!selectedPlanId) { Alert.alert('Error', 'Please select a subscription plan.'); return; }
    try {
      const checkoutPayload = {
        plan_id: selectedPlanId,
        promo_code: promoApplied ? promoCode : undefined, // Send undefined or null if not applied
        // These URLs would be handled by deep linking in a real app
        success_url: 'getmebuddy://subscription/success',
        cancel_url: 'getmebuddy://subscription/cancel',
      };
      // const response = await dispatch(createCheckoutSession(checkoutPayload));
      // In a real app, use response.checkout_url to open WebView/Browser
      console.log("Checkout session payload:", checkoutPayload); // Placeholder
      Alert.alert('Subscription Initiated', 'Redirecting to payment... (This is a placeholder)', [{ text: 'OK', onPress: () => { loadData(); /* navigation.goBack(); */ } }]);
    } catch (error) { console.error('Error processing subscription:', error); Alert.alert('Error', 'Failed to process subscription.'); }
  };

  const handleCancelSubscriptionAction = () => {
    Alert.alert('Cancel Subscription', 'Are you sure you want to cancel?', [
      { text: 'Keep It', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            // await dispatch(cancelSubscription());
            console.log("Cancelling subscription"); // Placeholder
            Alert.alert('Subscription Canceled', 'Your subscription has been canceled.', [{ text: 'OK', onPress: () => loadData() }]);
          } catch (error) { console.error('Error canceling subscription:', error); Alert.alert('Error', 'Failed to cancel subscription.'); }
        },
      },
    ]);
  };

  const renderPlanFeaturesList = (plan: SubscriptionPlan) => plan.features.map((feature, index) => (
    <View key={index} style={styles.featureItem}><Icon name="check-circle" type="material-community" size={18} color={COLORS.success} /><Text style={styles.featureText}>{feature}</Text></View>
  ));

  if (loading && !plans && !userSubscription) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading plans...</Text></SafeAreaView>;
  }

  const hasActiveSub = userSubscription?.status === 'active' && userSubscription.end_date && new Date(userSubscription.end_date) > new Date();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeader}>
          <Icon name={hasActiveSub ? "star-circle" : "rocket-launch"} type="material-community" size={40} color={COLORS.primary} />
          <Text style={styles.headerTitle}>{hasActiveSub ? 'Manage Your Subscription' : 'Choose Your Plan'}</Text>
          <Text style={styles.headerDescription}>{hasActiveSub ? `Current Plan: ${userSubscription!.plan.name}` : 'Unlock premium features and enhance your experience!'}</Text>
        </View>

        {hasActiveSub && userSubscription ? (
          <View style={styles.currentSubscriptionCard}>
            <View style={styles.planHeader}>
              <Text style={styles.currentPlanName}>{userSubscription.plan.name}</Text>
              <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>
            </View>
            <Text style={styles.currentPlanPrice}>${userSubscription.plan.price.toFixed(2)} / {userSubscription.plan.interval}</Text>
            <Text style={styles.renewalInfo}>Renews on: {new Date(userSubscription.end_date).toLocaleDateString()}</Text>
            <Divider style={styles.divider} />
            <Text style={styles.sectionSubtitle}>Plan Benefits:</Text>
            {renderPlanFeaturesList(userSubscription.plan)}
            <Button title="Cancel Subscription" type="outline" buttonStyle={styles.cancelButton} titleStyle={styles.cancelButtonText} onPress={handleCancelSubscriptionAction} icon={<Icon name="cancel" type="material-community" size={18} color={COLORS.error} containerStyle={{ marginRight: SPACING.small }} />} loading={processingPayment} disabled={processingPayment} />
          </View>
        ) : (
          <>
            <View style={styles.plansContainer}>
              {plans?.map((plan) => (
                <TouchableOpacity key={plan.id} style={[styles.planCard, selectedPlanId === plan.id && styles.selectedPlanCard]} onPress={() => setSelectedPlanId(plan.id)}>
                  {plan.is_popular && <View style={styles.popularBadge}><Text style={styles.popularText}>POPULAR</Text></View>}
                  <View style={styles.planHeaderRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Icon name={selectedPlanId === plan.id ? 'radio-button-checked' : 'radio-button-unchecked'} type="material" size={24} color={selectedPlanId === plan.id ? COLORS.primary : COLORS.grey500} />
                  </View>
                  <View style={styles.priceRow}><Text style={styles.priceCurrency}>$</Text><Text style={styles.priceAmount}>{plan.price.toFixed(2)}</Text><Text style={styles.priceInterval}>/ {plan.interval}</Text></View>
                  {promoApplied && selectedPlanId === plan.id && <Text style={styles.discountAppliedText}>{discountPercent}% OFF APPLIED!</Text>}
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <View style={styles.featuresList}>{renderPlanFeaturesList(plan)}</View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.promoCard}>
              <Text style={styles.promoTitle}>Have a Promo Code?</Text>
              <View style={styles.promoInputRow}><TextInput style={styles.promoInput} value={promoCode} onChangeText={setPromoCode} placeholder="Enter promo code" autoCapitalize="characters" /><Button title="Apply" buttonStyle={styles.promoApplyButton} titleStyle={TYPOGRAPHY.buttonSmall} onPress={handleApplyPromo} disabled={!promoCode.trim() || promoApplied || processingPayment} /></View>
              {promoApplied && <Text style={styles.promoStatusText}>Applied: {discountPercent}% discount!</Text>}
            </View>
            <View style={styles.subscribeActionContainer}>
              <Button title="Subscribe Now" buttonStyle={styles.subscribeButtonMain} titleStyle={TYPOGRAPHY.button} onPress={handleSubscribeAction} disabled={!selectedPlanId || processingPayment} loading={processingPayment} />
              <Text style={styles.termsText}>By subscribing, you agree to our Terms of Service. Cancel anytime.</Text>
            </View>
          </>
        )}
        <TouchableOpacity style={styles.faqLink} onPress={() => navigation.navigate('SubscriptionFAQ')}>
          <Icon name="help-circle-outline" type="material-community" size={20} color={COLORS.primary} /><Text style={styles.faqLinkText}>Subscription FAQ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles (condensed)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.large },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.medium },
  pageHeader: { padding: SPACING.medium, alignItems: 'center', backgroundColor: COLORS.white, marginBottom: SPACING.medium, borderBottomWidth:1, borderBottomColor: COLORS.grey200 },
  headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.textEmphasis, marginTop: SPACING.small, textAlign: 'center' },
  headerDescription: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xsmall },
  currentSubscriptionCard: { backgroundColor: COLORS.white, margin: SPACING.medium, borderRadius: 12, padding: SPACING.medium, elevation: 2, shadowColor:COLORS.black, shadowOpacity:0.1, shadowOffset:{width:0, height:1}, shadowRadius:2 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xsmall },
  currentPlanName: { ...TYPOGRAPHY.h2, color: COLORS.primary },
  activeBadge: { backgroundColor: COLORS.success, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall/2, borderRadius: 10 },
  activeBadgeText: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: 'bold' },
  currentPlanPrice: { ...TYPOGRAPHY.h3, color: COLORS.text, marginTop: SPACING.xsmall },
  renewalInfo: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.xsmall, marginBottom: SPACING.small },
  divider: { marginVertical: SPACING.medium },
  sectionSubtitle: { ...TYPOGRAPHY.subtitle, fontWeight:'bold', color: COLORS.text, marginBottom: SPACING.small },
  cancelButton: { borderColor: COLORS.error, borderWidth: 1, borderRadius: 8, marginTop: SPACING.medium },
  cancelButtonText: { ...TYPOGRAPHY.button, color: COLORS.error, fontSize: 14 },
  plansContainer: { paddingHorizontal: SPACING.medium },
  planCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.medium, marginBottom: SPACING.medium, borderWidth: 2, borderColor: COLORS.grey200, elevation: 1 },
  selectedPlanCard: { borderColor: COLORS.primary, elevation: 3, shadowColor:COLORS.primary, shadowOpacity:0.2, shadowOffset:{width:0,height:2}, shadowRadius:4 },
  popularBadge: { position: 'absolute', top: -10, right: SPACING.medium, backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, borderRadius: 8, transform: [{ rotate: '5deg' }] },
  popularText: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: 'bold', fontSize: 10 },
  planHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.small },
  planName: { ...TYPOGRAPHY.h2, color: COLORS.textEmphasis },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.xsmall },
  priceCurrency: { ...TYPOGRAPHY.subtitle, color: COLORS.primary, marginRight: 2 },
  priceAmount: { ...TYPOGRAPHY.h1, color: COLORS.primary, fontWeight: 'bold' },
  priceInterval: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginLeft: SPACING.xsmall },
  discountAppliedText: { ...TYPOGRAPHY.caption, color: COLORS.success, fontWeight: 'bold', marginBottom: SPACING.small },
  planDescription: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.small, minHeight: 40 },
  featuresList: { marginBottom: SPACING.medium },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xsmall },
  featureText: { ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: SPACING.small },
  promoCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.medium, borderRadius: 12, padding: SPACING.medium, marginBottom: SPACING.medium, elevation: 1 },
  promoTitle: { ...TYPOGRAPHY.subtitle, fontWeight:'bold', color: COLORS.text, marginBottom: SPACING.small },
  promoInputRow: { flexDirection: 'row', alignItems: 'center' },
  promoInput: { ...TYPOGRAPHY.body, flex: 1, borderWidth: 1, borderColor: COLORS.grey300, borderRadius: 8, paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, marginRight: SPACING.small, backgroundColor: COLORS.white },
  promoApplyButton: { backgroundColor: COLORS.secondary, borderRadius: 8, paddingVertical: SPACING.small, paddingHorizontal:SPACING.medium },
  promoStatusText: { ...TYPOGRAPHY.caption, color: COLORS.success, marginTop: SPACING.small, fontWeight: 'bold' },
  subscribeActionContainer: { paddingHorizontal: SPACING.medium, alignItems: 'center', marginBottom:SPACING.medium },
  subscribeButtonMain: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: SPACING.medium, width: '100%', elevation: 2 },
  termsText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.small },
  faqLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: SPACING.medium },
  faqLinkText: { ...TYPOGRAPHY.subtitle, color: COLORS.primary, marginLeft: SPACING.xsmall, fontWeight: 'bold' },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 26, fontWeight: 'bold' }, h2: { fontSize: 22, fontWeight: 'bold' }, h3: { fontSize: 18, fontWeight: '600'},
  subtitle: { fontSize: 16, fontWeight: 'normal' }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white || '#FFF' }, buttonSmall: { fontSize: 14, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', secondary: '#34D399', success: '#28a745', error: '#D32F2F',
  background: '#F4F6F8', white: '#FFFFFF', black: '#000000', text: '#333333',
  textEmphasis: '#111111', textSecondary: '#555555',
  grey200: '#E5E7EB', grey300: '#D1D5DB', grey500: '#6B7280',
  ...COLORS,
};

export default SubscriptionScreen;
