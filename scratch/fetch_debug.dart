import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> main() async {
  final apiUserOrderUrl = 'https://be-user-cleanco-739468618342.us-central1.run.app';
  print('Fetching orders from API...');
  
  try {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/orders'));
    if (response.statusCode == 200) {
      final List<dynamic> orders = jsonDecode(response.body);
      print('Total orders returned: ${orders.length}');
      
      final Map<dynamic, List<dynamic>> workerOrders = {};
      for (final o in orders) {
        final wId = o['worker_id'];
        workerOrders.putIfAbsent(wId, () => []).add(o);
      }
      
      print('\nUnique worker IDs and their order counts:');
      workerOrders.forEach((wId, list) {
        print('  Worker ID "$wId": ${list.length} orders');
      });
      
      // Let's print details of the most active worker's orders
      dynamic activeWorkerId;
      int maxOrders = 0;
      workerOrders.forEach((wId, list) {
        if (wId != null && list.length > maxOrders) {
          maxOrders = list.length;
          activeWorkerId = wId;
        }
      });
      
      if (activeWorkerId != null) {
        print('\nDetails for the most active worker (ID: $activeWorkerId):');
        for (final o in workerOrders[activeWorkerId]!) {
          print('Order #${o['id']}:');
          print('  User: ${o['user_name']}');
          print('  Service: ${o['service_name']}');
          print('  Status: ${o['status']}');
          print('  Scheduled At (Raw): ${o['scheduled_at']}');
          print('  Updated At (Raw): ${o['updated_at']}');
          print('  Total Price: ${o['total_price']}');
          print('---');
        }
      }
    } else {
      print('Failed to load orders: ${response.statusCode}');
    }
  } catch (e) {
    print('Error: $e');
  }
}
