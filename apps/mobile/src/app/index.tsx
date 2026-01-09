import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Vendor } from "@ultimate-sf/shared";
import { checkHealth } from "../services/healthService";
import { getVendors } from "../services/vendorService";
import VendorCard from "../components/VendorCard";
import { colors, spacing } from "../theme";

function HomeScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("Checking API...");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);

      // Check API health
      const health = await checkHealth();
      if (health.ok) {
        setHealthStatus("API connected ✅");
      } else {
        setHealthStatus("API error ⚠️");
      }

      // Load vendors
      const vendorsData = await getVendors();
      setVendors(vendorsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Check your connection.");
      setHealthStatus("API disconnected ❌");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>Loading street food vendors...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Health Status Bar */}
      <View style={styles.healthBar}>
        <Text style={styles.healthText}>{healthStatus}</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Vendor List */}
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VendorCard vendor={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vendors found</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg.secondary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary,
  },
  healthBar: {
    backgroundColor: colors.bg.healthBar,
    padding: spacing.sm + 4,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.healthBar,
  },
  healthText: {
    fontSize: 14,
    color: colors.text.success,
    fontWeight: "600",
  },
  errorBar: {
    backgroundColor: colors.bg.errorBar,
    padding: spacing.sm + 4,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.errorBar,
  },
  errorText: {
    fontSize: 14,
    color: colors.ui.error,
    fontWeight: "600",
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.disabled,
  },
});

export { HomeScreen };
export default HomeScreen;
